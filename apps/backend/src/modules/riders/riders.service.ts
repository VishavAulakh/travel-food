import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../database/prisma.service'
import { RedisService } from '../../common/services/redis.service'
import { SendRiderOtpDto, VerifyRiderOtpDto } from './dto/rider-otp.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { RiderDeliveryStatus, UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto'

@Injectable()
export class RidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  // ─── Auth ──────────────────────────────────────────────────────────────────

  async sendOtp(dto: SendRiderOtpDto) {
    let rider = await this.prisma.riders.findUnique({ where: { phone: dto.phone } })

    if (!rider) {
      if (!dto.name) {
        throw new BadRequestException('Name is required for new riders')
      }
      rider = await this.prisma.riders.create({
        data: {
          phone: dto.phone,
          name: dto.name,
          vehicleType: dto.vehicleType ?? 'bike',
        },
      })
    }

    await this.prisma.riderOtps.create({
      data: {
        riderId: rider.id,
        otp: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    return { message: 'OTP sent', devOtp: '123456' }
  }

  async verifyOtp(dto: VerifyRiderOtpDto) {
    const rider = await this.prisma.riders.findUnique({ where: { phone: dto.phone } })
    if (!rider) {
      throw new UnauthorizedException('Rider not found')
    }

    const otpRecord = await this.prisma.riderOtps.findFirst({
      where: {
        riderId: rider.id,
        otp: dto.otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      throw new UnauthorizedException('OTP is invalid or has expired')
    }

    await this.prisma.riderOtps.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    const accessToken = this.jwtService.sign(
      { sub: rider.id, type: 'rider' },
      {
        secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
        expiresIn: '30d',
      },
    )

    return { accessToken, rider }
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  async getProfile(riderId: string) {
    const rider = await this.prisma.riders.findUnique({ where: { id: riderId } })
    if (!rider) {
      throw new NotFoundException('Rider not found')
    }
    return rider
  }

  // ─── Availability ──────────────────────────────────────────────────────────

  async updateAvailability(riderId: string, isOnline: boolean) {
    const rider = await this.prisma.riders.update({
      where: { id: riderId },
      data: { isOnline, lastSeenAt: new Date() },
    })

    if (isOnline) {
      await this.redis.set(`rider:online:${riderId}`, '1', 120)
    } else {
      await this.redis.del(`rider:online:${riderId}`)
    }

    return rider
  }

  // ─── Location ──────────────────────────────────────────────────────────────

  async updateLocation(riderId: string, dto: UpdateLocationDto) {
    await this.prisma.riders.update({
      where: { id: riderId },
      data: {
        lastLat: dto.lat,
        lastLng: dto.lng,
        lastSeenAt: new Date(),
      },
    })

    await this.redis.set(
      `rider:location:${riderId}`,
      JSON.stringify({ lat: dto.lat, lng: dto.lng, ts: Date.now() }),
      60,
    )

    return { ok: true }
  }

  // ─── Delivery Requests ─────────────────────────────────────────────────────

  async getDeliveryRequests(riderId: string) {
    const rider = await this.prisma.riders.findUnique({ where: { id: riderId } })
    if (!rider) {
      throw new NotFoundException('Rider not found')
    }

    const orders = await this.prisma.deliveryOrders.findMany({
      where: {
        status: 'placed',
        riderId: null,
      },
      include: {
        branch: true,
        items: true,
      },
    })

    const riderLat = rider.lastLat
    const riderLng = rider.lastLng

    if (riderLat == null || riderLng == null) {
      return []
    }

    const nearby = orders
      .map((order) => {
        const branchLat = order.branch.lat
        const branchLng = order.branch.lng

        if (branchLat == null || branchLng == null) return null

        const distanceKm = this.haversineKm(riderLat, riderLng, branchLat, branchLng)
        if (distanceKm > 10) return null

        return { ...order, distanceKm }
      })
      .filter((o): o is NonNullable<typeof o> => o !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5)

    return nearby
  }

  // ─── Accept Delivery ───────────────────────────────────────────────────────

  async acceptDelivery(riderId: string, orderId: string) {
    const order = await this.prisma.deliveryOrders.findUnique({ where: { id: orderId } })
    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.riderId !== null) {
      throw new ConflictException('Order already assigned')
    }

    const updatedOrder = await this.prisma.deliveryOrders.update({
      where: { id: orderId },
      data: {
        riderId,
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    })

    await this.prisma.riderEarnings.create({
      data: {
        riderId,
        orderId,
        amountPaise: order.deliveryFeePaise,
        type: 'delivery',
      },
    })

    return updatedOrder
  }

  // ─── Update Delivery Status ────────────────────────────────────────────────

  async updateDeliveryStatus(riderId: string, orderId: string, dto: UpdateDeliveryStatusDto) {
    const order = await this.prisma.deliveryOrders.findUnique({ where: { id: orderId } })
    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.riderId !== riderId) {
      throw new ForbiddenException('You are not assigned to this order')
    }

    const timestampField = this.statusToTimestampField(dto.status)
    const timestampData = timestampField ? { [timestampField]: new Date() } : {}

    const updatedOrder = await this.prisma.deliveryOrders.update({
      where: { id: orderId },
      data: {
        status: dto.status as any,
        ...timestampData,
      },
    })

    return updatedOrder
  }

  private statusToTimestampField(status: RiderDeliveryStatus): string | null {
    const map: Partial<Record<RiderDeliveryStatus, string>> = {
      [RiderDeliveryStatus.CONFIRMED]: 'confirmedAt',
      [RiderDeliveryStatus.PREPARING]: 'prepStartedAt',
      [RiderDeliveryStatus.READY_FOR_PICKUP]: 'readyAt',
      [RiderDeliveryStatus.PICKED_UP]: 'pickedUpAt',
      [RiderDeliveryStatus.DELIVERED]: 'deliveredAt',
    }
    return map[status] ?? null
  }

  // ─── Earnings ──────────────────────────────────────────────────────────────

  async getEarnings(riderId: string) {
    const allEarnings = await this.prisma.riderEarnings.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
    })

    const nowIst = new Date(Date.now() + 5.5 * 60 * 60 * 1000)

    const todayStart = new Date(nowIst)
    todayStart.setUTCHours(0, 0, 0, 0)
    todayStart.setTime(todayStart.getTime() - 5.5 * 60 * 60 * 1000)

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const monthStartIst = new Date(nowIst)
    monthStartIst.setUTCDate(1)
    monthStartIst.setUTCHours(0, 0, 0, 0)
    const monthStart = new Date(monthStartIst.getTime() - 5.5 * 60 * 60 * 1000)

    const todayPaise = allEarnings
      .filter((e) => e.createdAt >= todayStart)
      .reduce((sum, e) => sum + e.amountPaise, 0)

    const weekPaise = allEarnings
      .filter((e) => e.createdAt >= weekStart)
      .reduce((sum, e) => sum + e.amountPaise, 0)

    const monthPaise = allEarnings
      .filter((e) => e.createdAt >= monthStart)
      .reduce((sum, e) => sum + e.amountPaise, 0)

    const totalDeliveries = allEarnings.length
    const totalPaise = allEarnings.reduce((sum, e) => sum + e.amountPaise, 0)
    const avgPerDeliveryPaise = totalDeliveries > 0 ? Math.round(totalPaise / totalDeliveries) : 0

    const recentEarnings = allEarnings.slice(0, 10)

    return {
      todayPaise,
      weekPaise,
      monthPaise,
      totalDeliveries,
      avgPerDeliveryPaise,
      recentEarnings,
    }
  }

  // ─── Order by ID ───────────────────────────────────────────────────────────

  async getOrderById(riderId: string, orderId: string) {
    const order = await this.prisma.deliveryOrders.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        branch: { select: { id: true, name: true, address: true, lat: true, lng: true, phone: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    })
    if (!order) throw new NotFoundException('Order not found')
    if (order.riderId !== riderId) throw new ForbiddenException('Not assigned to this order')
    return order
  }

  // ─── Delivery History ──────────────────────────────────────────────────────

  async getDeliveryHistory(riderId: string, limit: number) {
    return this.prisma.deliveryOrders.findMany({
      where: {
        riderId,
        status: { in: ['delivered', 'cancelled'] as any[] },
      },
      include: {
        items: true,
        branch: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  // ─── Active Order ──────────────────────────────────────────────────────────

  async getActiveOrder(riderId: string) {
    const order = await this.prisma.deliveryOrders.findFirst({
      where: {
        riderId,
        status: { notIn: ['delivered', 'cancelled'] as any[] },
      },
      include: {
        items: true,
        branch: true,
      },
    })

    return order ?? null
  }

  // ─── Haversine ─────────────────────────────────────────────────────────────

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
}

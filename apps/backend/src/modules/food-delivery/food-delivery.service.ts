import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../database/prisma.service'
import { SendCustomerOtpDto, VerifyCustomerOtpDto } from './dto/customer-otp.dto'
import { PlaceOrderDto } from './dto/place-order.dto'

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface CustomerJwtPayload {
  sub: string
  type: 'customer'
}

interface PromoResult {
  valid: boolean
  discountPaise: number
  message: string
  freeDelivery?: boolean
}

export interface BranchWithDetails {
  id: string
  restaurantId: string
  name: string
  code: string
  address: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  restaurant: {
    name: string
    logoUrl: string | null
  }
  zone: {
    id: string
    radiusKm: number
    centerLat: number | null
    centerLng: number | null
    minOrderPaise: number
    deliveryFeePaise: number
    isActive: boolean
  } | null
  hours: {
    dayOfWeek: number
    isOpen: boolean
    opensAt: string
    closesAt: string
  }[]
  distanceKm?: number
  isOpen?: boolean
}

// ---------------------------------------------------------------------------
// Promo catalog (mock)
// ---------------------------------------------------------------------------

const PROMO_CATALOG: Record<
  string,
  { type: 'percent_cap' | 'flat_min' | 'free_delivery' | 'flat'; value: number; cap?: number; min?: number; label: string }
> = {
  WELCOME60: { type: 'percent_cap', value: 60, cap: 6000, label: '60% off up to ₹60' },
  FLAT100:   { type: 'flat_min', value: 10000, min: 40000, label: '₹100 off on orders above ₹400' },
  FREEDEL:   { type: 'free_delivery', value: 0, label: 'Free delivery' },
  UPI50:     { type: 'flat', value: 5000, label: '₹50 off' },
}

// ---------------------------------------------------------------------------

@Injectable()
export class FoodDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Auth ────────────────────────────────────────────────────────────────

  async sendOtp(dto: SendCustomerOtpDto): Promise<{ message: string; devOtp: string }> {
    // Find or create customer
    let customer = await this.prisma.deliveryCustomers.findUnique({
      where: { phone: dto.phone },
    })

    if (!customer) {
      customer = await this.prisma.deliveryCustomers.create({
        data: {
          phone: dto.phone,
          name: dto.name ?? null,
        },
      })
    } else if (dto.name && !customer.name) {
      customer = await this.prisma.deliveryCustomers.update({
        where: { id: customer.id },
        data: { name: dto.name },
      })
    }

    // Invalidate any existing unused OTPs for this customer
    await this.prisma.customerOtps.updateMany({
      where: { customerId: customer.id, used: false },
      data: { used: true },
    })

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await this.prisma.customerOtps.create({
      data: {
        customerId: customer.id,
        otp: '123456', // dev stub — replace with SMS provider in production
        expiresAt,
      },
    })

    return { message: 'OTP sent', devOtp: '123456' }
  }

  async verifyOtp(
    dto: VerifyCustomerOtpDto,
  ): Promise<{ accessToken: string; customer: { id: string; phone: string; name: string | null } }> {
    const customer = await this.prisma.deliveryCustomers.findUnique({
      where: { phone: dto.phone },
    })

    if (!customer) throw new UnauthorizedException('Phone number not registered')

    const otpRecord = await this.prisma.customerOtps.findFirst({
      where: {
        customerId: customer.id,
        otp: dto.otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) throw new UnauthorizedException('Invalid or expired OTP')

    await this.prisma.customerOtps.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    const payload: CustomerJwtPayload = { sub: customer.id, type: 'customer' }
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
      expiresIn: '30d',
    })

    return {
      accessToken,
      customer: { id: customer.id, phone: customer.phone, name: customer.name },
    }
  }

  // ─── Restaurants ─────────────────────────────────────────────────────────

  async getRestaurants(lat?: number, lng?: number): Promise<BranchWithDetails[]> {
    const branches = await this.prisma.branches.findMany({
      where: {
        isActive: true,
        zone: { isActive: true },
      },
      include: {
        restaurant: { select: { name: true, logoUrl: true } },
        zone: {
          select: {
            id: true,
            radiusKm: true,
            centerLat: true,
            centerLng: true,
            minOrderPaise: true,
            deliveryFeePaise: true,
            isActive: true,
          },
        },
        hours: {
          select: { dayOfWeek: true, isOpen: true, opensAt: true, closesAt: true },
        },
      },
    })

    const withMeta: BranchWithDetails[] = branches
      .map((branch) => {
        let distanceKm: number | undefined = undefined

        if (
          lat !== undefined &&
          lng !== undefined &&
          branch.lat !== null &&
          branch.lng !== null
        ) {
          distanceKm = this.haversineKm(lat, lng, branch.lat, branch.lng)
        }

        const isOpen = this.isCurrentlyOpen(branch.hours)

        return { ...branch, distanceKm, isOpen }
      })
      .filter((branch) => {
        // If the caller provided coordinates, filter by zone radius
        if (
          branch.distanceKm !== undefined &&
          branch.zone &&
          branch.distanceKm > branch.zone.radiusKm
        ) {
          return false
        }
        return true
      })

    // Sort by distance if available, otherwise by name
    withMeta.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm
      }
      return a.restaurant.name.localeCompare(b.restaurant.name)
    })

    return withMeta
  }

  // ─── Menu ─────────────────────────────────────────────────────────────────

  async getMenu(branchId: string): Promise<{
    branchId: string
    restaurantId: string
    categories: {
      id: string
      name: string
      sortOrder: number
      items: {
        id: string
        name: string
        description: string | null
        basePrice: number
        imageUrl: string | null
        vegNonVeg: string
        isAvailable: boolean
      }[]
    }[]
  }> {
    const branch = await this.prisma.branches.findUnique({
      where: { id: branchId },
    })

    if (!branch || !branch.isActive) throw new NotFoundException('Branch not found')

    const categories = await this.prisma.menuCategories.findMany({
      where: { restaurantId: branch.restaurantId },
      include: {
        items: {
          where: { isAvailable: true, isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            imageUrl: true,
            vegNonVeg: true,
            isAvailable: true,
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return {
      branchId,
      restaurantId: branch.restaurantId,
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        sortOrder: cat.sortOrder,
        items: cat.items,
      })),
    }
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  async placeOrder(customerId: string, dto: PlaceOrderDto) {
    // Validate branch
    const branch = await this.prisma.branches.findUnique({
      where: { id: dto.branchId },
      include: {
        zone: true,
        restaurant: { select: { id: true, name: true } },
      },
    })

    if (!branch || !branch.isActive) throw new NotFoundException('Branch not found or inactive')

    // Calculate subtotal
    const subtotalPaise = dto.items.reduce(
      (sum, item) => sum + item.qty * item.unitPricePaise,
      0,
    )

    if (subtotalPaise <= 0) throw new BadRequestException('Order total must be greater than zero')

    // Delivery fee from zone or default
    const baseDeliveryFeePaise = branch.zone?.deliveryFeePaise ?? 4900

    // Validate minimum order
    const minOrderPaise = branch.zone?.minOrderPaise ?? 15000
    if (subtotalPaise < minOrderPaise) {
      throw new BadRequestException(
        `Minimum order is ₹${(minOrderPaise / 100).toFixed(0)}. Current subtotal is ₹${(subtotalPaise / 100).toFixed(0)}.`,
      )
    }

    // Tax: 5% of subtotal (GST)
    const taxPaise = Math.round(subtotalPaise * 0.05)

    // Platform fee (flat)
    const platformFeePaise = 500

    // Promo discount
    let discountPaise = 0
    let finalDeliveryFeePaise = baseDeliveryFeePaise

    if (dto.promoCode) {
      const promo = this.applyPromoLogic(dto.promoCode.toUpperCase(), subtotalPaise)
      if (!promo.valid) throw new BadRequestException(promo.message)
      discountPaise = promo.discountPaise
      if (promo.freeDelivery) finalDeliveryFeePaise = 0
    }

    const totalPaise = subtotalPaise + finalDeliveryFeePaise + platformFeePaise + taxPaise - discountPaise

    const orderNumber = `TF-${Date.now()}`

    // Try to assign nearest online rider
    let nearestRiderId: string | null = null

    if (branch.lat !== null && branch.lng !== null) {
      const onlineRiders = await this.prisma.riders.findMany({
        where: { isOnline: true, status: 'active' },
        select: { id: true, lastLat: true, lastLng: true },
      })

      let minDistance = Infinity

      for (const rider of onlineRiders) {
        if (rider.lastLat !== null && rider.lastLng !== null) {
          const dist = this.haversineKm(rider.lastLat, rider.lastLng, branch.lat, branch.lng)
          if (dist < minDistance) {
            minDistance = dist
            nearestRiderId = rider.id
          }
        }
      }
    }

    // Create order with items
    const order = await this.prisma.deliveryOrders.create({
      data: {
        restaurantId: branch.restaurant.id,
        branchId: branch.id,
        customerId,
        riderId: nearestRiderId,
        orderNumber,
        subtotalPaise,
        deliveryFeePaise: finalDeliveryFeePaise,
        platformFeePaise,
        taxPaise,
        discountPaise,
        totalPaise,
        promoCode: dto.promoCode ?? null,
        deliveryAddressLine: dto.deliveryAddressLine,
        deliveryLat: dto.deliveryLat ?? null,
        deliveryLng: dto.deliveryLng ?? null,
        specialInstructions: dto.specialInstructions ?? null,
        items: {
          create: dto.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            qty: item.qty,
            unitPricePaise: item.unitPricePaise,
          })),
        },
      },
      include: { items: true },
    })

    return order
  }

  async getCustomerOrders(customerId: string) {
    return this.prisma.deliveryOrders.findMany({
      where: { customerId },
      include: {
        items: true,
        branch: {
          select: { id: true, name: true, address: true },
        },
        restaurant: {
          select: { id: true, name: true, logoUrl: true },
        },
        rider: {
          select: { id: true, name: true, phone: true, vehicleType: true, lastLat: true, lastLng: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getOrder(customerId: string, orderId: string) {
    const order = await this.prisma.deliveryOrders.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        branch: {
          select: { id: true, name: true, address: true, lat: true, lng: true },
        },
        restaurant: {
          select: { id: true, name: true, logoUrl: true },
        },
        rider: {
          select: { id: true, name: true, phone: true, vehicleType: true, vehicleNumber: true, lastLat: true, lastLng: true },
        },
      },
    })

    if (!order) throw new NotFoundException('Order not found')
    if (order.customerId !== customerId) throw new NotFoundException('Order not found')

    return order
  }

  async validatePromo(
    code: string,
    subtotalPaise: number,
  ): Promise<{ valid: boolean; discountPaise: number; message: string }> {
    const result = this.applyPromoLogic(code.toUpperCase(), subtotalPaise)
    return {
      valid: result.valid,
      discountPaise: result.discountPaise,
      message: result.message,
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private applyPromoLogic(code: string, subtotalPaise: number): PromoResult {
    const promo = PROMO_CATALOG[code]

    if (!promo) {
      return { valid: false, discountPaise: 0, message: 'Invalid promo code' }
    }

    if (promo.type === 'percent_cap') {
      const rawDiscount = Math.round(subtotalPaise * (promo.value / 100))
      const discountPaise = Math.min(rawDiscount, promo.cap ?? rawDiscount)
      return {
        valid: true,
        discountPaise,
        message: promo.label,
      }
    }

    if (promo.type === 'flat_min') {
      if (subtotalPaise < (promo.min ?? 0)) {
        return {
          valid: false,
          discountPaise: 0,
          message: `Minimum order of ₹${((promo.min ?? 0) / 100).toFixed(0)} required for ${code}`,
        }
      }
      return {
        valid: true,
        discountPaise: promo.value,
        message: promo.label,
      }
    }

    if (promo.type === 'free_delivery') {
      return {
        valid: true,
        discountPaise: 0,
        freeDelivery: true,
        message: promo.label,
      }
    }

    if (promo.type === 'flat') {
      const discountPaise = Math.min(promo.value, subtotalPaise)
      return {
        valid: true,
        discountPaise,
        message: promo.label,
      }
    }

    return { valid: false, discountPaise: 0, message: 'Invalid promo code' }
  }

  private haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
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

  private isCurrentlyOpen(
    hours: { dayOfWeek: number; isOpen: boolean; opensAt: string; closesAt: string }[],
  ): boolean {
    // Convert to IST (UTC+5:30)
    const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
    const day = now.getUTCDay()
    const hhmm = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
    const h = hours.find((x) => x.dayOfWeek === day)
    if (!h || !h.isOpen) return false
    return hhmm >= h.opensAt && hhmm <= h.closesAt
  }
}

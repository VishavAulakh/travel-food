import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CheckCoverageDto } from './dto/check-coverage.dto'
import { UpsertZoneDto } from './dto/upsert-zone.dto'
import { UpsertOpeningHoursDto } from './dto/opening-hours.dto'
import { RestaurantUserPayload } from './decorators/current-restaurant-user.decorator'

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public: check if a lat/lng is covered by any active zone ────────────

  async checkCoverage(dto: CheckCoverageDto) {
    const zones = await this.prisma.deliveryZones.findMany({
      where: { isActive: true },
      include: { branch: true },
    })

    const results = zones.map((zone) => {
      const centreLat = zone.centerLat ?? zone.branch.lat ?? 0
      const centreLng = zone.centerLng ?? zone.branch.lng ?? 0
      const distanceKm = this.haversineKm(dto.lat, dto.lng, centreLat, centreLng)
      return {
        zoneId: zone.id,
        branchId: zone.branchId,
        branchName: zone.branch.name,
        radiusKm: zone.radiusKm,
        distanceKm: Math.round(distanceKm * 100) / 100,
        minOrderPaise: zone.minOrderPaise,
        deliveryFeePaise: zone.deliveryFeePaise,
        covered: distanceKm <= zone.radiusKm,
      }
    })

    results.sort((a, b) => a.distanceKm - b.distanceKm)

    return {
      covered: results.some((z) => z.covered),
      zones: results,
    }
  }

  // ─── Public: opening hours for a branch ──────────────────────────────────

  async getBranchHours(branchId: string) {
    const branch = await this.prisma.branches.findUnique({ where: { id: branchId } })
    if (!branch) throw new NotFoundException(`Branch ${branchId} not found`)

    const rows = await this.prisma.openingHours.findMany({
      where: { branchId },
      orderBy: { dayOfWeek: 'asc' },
    })

    const hours =
      rows.length === 0
        ? this.defaultHours()
        : rows.map((r) => ({
            dayOfWeek: r.dayOfWeek,
            isOpen: r.isOpen,
            opensAt: r.opensAt,
            closesAt: r.closesAt,
          }))

    return { branchId, hours }
  }

  // ─── Public: zone info for a branch ──────────────────────────────────────

  async getBranchZone(branchId: string) {
    const zone = await this.prisma.deliveryZones.findUnique({ where: { branchId } })
    if (!zone) throw new NotFoundException(`No delivery zone configured for branch ${branchId}`)
    return zone
  }

  // ─── Authenticated: upsert zone ──────────────────────────────────────────

  async upsertZone(branchId: string, dto: UpsertZoneDto, restaurantUser: RestaurantUserPayload) {
    const branch = await this.prisma.branches.findUnique({ where: { id: branchId } })
    if (!branch) throw new NotFoundException(`Branch ${branchId} not found`)
    if (branch.restaurantId !== restaurantUser.restaurantId) {
      throw new ForbiddenException('You do not have permission to manage this branch')
    }

    const zone = await this.prisma.deliveryZones.upsert({
      where: { branchId },
      create: {
        restaurantId: branch.restaurantId,
        branchId,
        radiusKm: dto.radiusKm,
        centerLat: dto.centerLat,
        centerLng: dto.centerLng,
        minOrderPaise: dto.minOrderPaise,
        deliveryFeePaise: dto.deliveryFeePaise,
        isActive: dto.isActive,
      },
      update: {
        radiusKm: dto.radiusKm,
        centerLat: dto.centerLat,
        centerLng: dto.centerLng,
        minOrderPaise: dto.minOrderPaise,
        deliveryFeePaise: dto.deliveryFeePaise,
        isActive: dto.isActive,
      },
    })

    return zone
  }

  // ─── Authenticated: upsert opening hours ─────────────────────────────────

  async upsertHours(
    branchId: string,
    dto: UpsertOpeningHoursDto,
    restaurantUser: RestaurantUserPayload,
  ) {
    const branch = await this.prisma.branches.findUnique({ where: { id: branchId } })
    if (!branch) throw new NotFoundException(`Branch ${branchId} not found`)
    if (branch.restaurantId !== restaurantUser.restaurantId) {
      throw new ForbiddenException('You do not have permission to manage this branch')
    }

    const hours = await Promise.all(
      dto.hours.map((row) =>
        this.prisma.openingHours.upsert({
          where: { branchId_dayOfWeek: { branchId, dayOfWeek: row.dayOfWeek } },
          create: {
            restaurantId: branch.restaurantId,
            branchId,
            dayOfWeek: row.dayOfWeek,
            isOpen: row.isOpen,
            opensAt: row.opensAt,
            closesAt: row.closesAt,
          },
          update: {
            isOpen: row.isOpen,
            opensAt: row.opensAt,
            closesAt: row.closesAt,
          },
        }),
      ),
    )

    return {
      branchId,
      hours: hours
        .map((r) => ({
          dayOfWeek: r.dayOfWeek,
          isOpen: r.isOpen,
          opensAt: r.opensAt,
          closesAt: r.closesAt,
        }))
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    }
  }

  // ─── Authenticated: toggle zone active status ─────────────────────────────

  async toggleZoneStatus(
    branchId: string,
    isActive: boolean,
    restaurantUser: RestaurantUserPayload,
  ) {
    const zone = await this.prisma.deliveryZones.findUnique({
      where: { branchId },
      include: { branch: true },
    })
    if (!zone) throw new NotFoundException(`No delivery zone configured for branch ${branchId}`)
    if (zone.branch.restaurantId !== restaurantUser.restaurantId) {
      throw new ForbiddenException('You do not have permission to manage this branch')
    }

    return this.prisma.deliveryZones.update({
      where: { branchId },
      data: { isActive },
    })
  }

  // ─── Public: pageable list of restaurants with coverage + open status ────

  async getRestaurantsList(lat?: number, lng?: number) {
    const branches = await this.prisma.branches.findMany({
      where: {
        isActive: true,
        zone: { isActive: true },
      },
      include: {
        restaurant: true,
        zone: true,
        hours: true,
      },
    })

    const now = this.nowInIST()

    const formatted = branches.map((branch) => {
      const distanceKm =
        lat !== undefined && lng !== undefined && branch.lat && branch.lng
          ? Math.round(this.haversineKm(lat, lng, branch.lat, branch.lng) * 100) / 100
          : null

      return {
        branchId: branch.id,
        restaurantId: branch.restaurantId,
        restaurantName: branch.restaurant.name,
        branchName: branch.name,
        logoUrl: branch.restaurant.logoUrl ?? null,
        address: branch.address ?? null,
        lat: branch.lat ?? null,
        lng: branch.lng ?? null,
        distanceKm,
        isOpen: this.isCurrentlyOpen(branch.hours),
        zone: branch.zone
          ? {
              radiusKm: branch.zone.radiusKm,
              minOrderPaise: branch.zone.minOrderPaise,
              deliveryFeePaise: branch.zone.deliveryFeePaise,
            }
          : null,
        _sortKey: distanceKm ?? Infinity,
      }
    })

    formatted.sort((a, b) => a._sortKey - b._sortKey)

    return formatted.map(({ _sortKey, ...rest }) => rest)
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  private isCurrentlyOpen(hours: any[]): boolean {
    if (!hours || hours.length === 0) return false

    // IST = UTC+5:30
    const nowUtc = new Date()
    const istOffset = 5 * 60 + 30 // minutes
    const istMs = nowUtc.getTime() + istOffset * 60_000
    const istDate = new Date(istMs)

    const dayOfWeek = istDate.getUTCDay() // 0=Sun
    const currentMinutes = istDate.getUTCHours() * 60 + istDate.getUTCMinutes()

    const todayRow = hours.find((h: any) => h.dayOfWeek === dayOfWeek)
    if (!todayRow || !todayRow.isOpen) return false

    const [openH, openM] = (todayRow.opensAt as string).split(':').map(Number)
    const [closeH, closeM] = (todayRow.closesAt as string).split(':').map(Number)
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes
  }

  private nowInIST(): Date {
    const nowUtc = new Date()
    const istOffset = 5 * 60 + 30
    return new Date(nowUtc.getTime() + istOffset * 60_000)
  }

  private defaultHours() {
    return Array.from({ length: 7 }, (_, day) => ({
      dayOfWeek: day,
      isOpen: day !== 0, // Sunday closed
      opensAt: '11:00',
      closesAt: '23:00',
    }))
  }
}

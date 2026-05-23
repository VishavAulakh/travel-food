import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { ZonesService } from './zones.service'
import { RestaurantAuthGuard } from './guards/restaurant-auth.guard'
import {
  CurrentRestaurantUser,
  RestaurantUserPayload,
} from './decorators/current-restaurant-user.decorator'
import { CheckCoverageDto } from './dto/check-coverage.dto'
import { UpsertZoneDto } from './dto/upsert-zone.dto'
import { UpsertOpeningHoursDto } from './dto/opening-hours.dto'
import { IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'

class ToggleStatusDto {
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean
}

@ApiTags('zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  // ─── Public ────────────────────────────────────────────────────────────────

  @Get('check-coverage')
  @ApiOperation({ summary: 'Check whether a lat/lng point is within any active delivery zone' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  checkCoverage(@Query() query: CheckCoverageDto) {
    return this.zonesService.checkCoverage(query)
  }

  @Get('branches/:branchId/hours')
  @ApiOperation({ summary: 'Get opening hours for a branch (returns defaults if none configured)' })
  getBranchHours(@Param('branchId') branchId: string) {
    return this.zonesService.getBranchHours(branchId)
  }

  @Get('branches/:branchId/zone')
  @ApiOperation({ summary: 'Get the delivery zone configured for a branch' })
  getBranchZone(@Param('branchId') branchId: string) {
    return this.zonesService.getBranchZone(branchId)
  }

  @Get('restaurants')
  @ApiOperation({ summary: 'List all active restaurants with open status and optional distance' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  getRestaurantsList(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const latNum = lat !== undefined ? parseFloat(lat) : undefined
    const lngNum = lng !== undefined ? parseFloat(lng) : undefined
    return this.zonesService.getRestaurantsList(latNum, lngNum)
  }

  // ─── Authenticated ─────────────────────────────────────────────────────────

  @Put('branches/:branchId/zone')
  @UseGuards(RestaurantAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update the delivery zone for a branch' })
  upsertZone(
    @Param('branchId') branchId: string,
    @Body() dto: UpsertZoneDto,
    @CurrentRestaurantUser() restaurantUser: RestaurantUserPayload,
  ) {
    return this.zonesService.upsertZone(branchId, dto, restaurantUser)
  }

  @Put('branches/:branchId/hours')
  @UseGuards(RestaurantAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update opening hours for a branch (all 7 days)' })
  upsertHours(
    @Param('branchId') branchId: string,
    @Body() dto: UpsertOpeningHoursDto,
    @CurrentRestaurantUser() restaurantUser: RestaurantUserPayload,
  ) {
    return this.zonesService.upsertHours(branchId, dto, restaurantUser)
  }

  @Patch('branches/:branchId/status')
  @UseGuards(RestaurantAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status of a branch delivery zone' })
  toggleZoneStatus(
    @Param('branchId') branchId: string,
    @Body() body: ToggleStatusDto,
    @CurrentRestaurantUser() restaurantUser: RestaurantUserPayload,
  ) {
    return this.zonesService.toggleZoneStatus(branchId, body.isActive, restaurantUser)
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { RidersService } from './riders.service'
import { RiderAuthGuard } from './guards/rider-auth.guard'
import { CurrentRider } from './decorators/current-rider.decorator'
import { SendRiderOtpDto, VerifyRiderOtpDto } from './dto/rider-otp.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto'

@ApiTags('riders')
@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  // ─── Auth ──────────────────────────────────────────────────────────────────

  @Post('auth/send-otp')
  @ApiOperation({ summary: 'Send OTP to rider phone (creates rider if new)' })
  sendOtp(@Body() dto: SendRiderOtpDto) {
    return this.ridersService.sendOtp(dto)
  }

  @Post('auth/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and receive access token' })
  verifyOtp(@Body() dto: VerifyRiderOtpDto) {
    return this.ridersService.verifyOtp(dto)
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  @Get('me/profile')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current rider profile' })
  getProfile(@CurrentRider() rider: { sub: string }) {
    return this.ridersService.getProfile(rider.sub)
  }

  // ─── Availability ──────────────────────────────────────────────────────────

  @Patch('me/availability')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle rider online/offline status' })
  updateAvailability(
    @CurrentRider() rider: { sub: string },
    @Body() body: { isOnline: boolean },
  ) {
    return this.ridersService.updateAvailability(rider.sub, body.isOnline)
  }

  // ─── Location ──────────────────────────────────────────────────────────────

  @Post('me/location')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update rider GPS location' })
  updateLocation(
    @CurrentRider() rider: { sub: string },
    @Body() dto: UpdateLocationDto,
  ) {
    return this.ridersService.updateLocation(rider.sub, dto)
  }

  // ─── Delivery Requests ─────────────────────────────────────────────────────

  @Get('me/delivery-requests')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get nearby unassigned delivery orders (within 10km, max 5)' })
  getDeliveryRequests(@CurrentRider() rider: { sub: string }) {
    return this.ridersService.getDeliveryRequests(rider.sub)
  }

  // ─── Accept Delivery ───────────────────────────────────────────────────────

  @Post('delivery/:orderId/accept')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a delivery order' })
  acceptDelivery(
    @CurrentRider() rider: { sub: string },
    @Param('orderId') orderId: string,
  ) {
    return this.ridersService.acceptDelivery(rider.sub, orderId)
  }

  // ─── Update Delivery Status ────────────────────────────────────────────────

  @Patch('delivery/:orderId/status')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery order status' })
  updateDeliveryStatus(
    @CurrentRider() rider: { sub: string },
    @Param('orderId') orderId: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.ridersService.updateDeliveryStatus(rider.sub, orderId, dto)
  }

  // ─── Order by ID ──────────────────────────────────────────────────────────

  @Get('delivery/:orderId')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific delivery order assigned to this rider' })
  getOrderById(
    @CurrentRider() rider: { sub: string },
    @Param('orderId') orderId: string,
  ) {
    return this.ridersService.getOrderById(rider.sub, orderId)
  }

  // ─── Delivery History ─────────────────────────────────────────────────────

  @Get('me/delivery-history')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get past completed/cancelled deliveries for this rider' })
  getDeliveryHistory(
    @CurrentRider() rider: { sub: string },
    @Query('limit') limit?: string,
  ) {
    return this.ridersService.getDeliveryHistory(rider.sub, limit ? parseInt(limit, 10) : 10)
  }

  // ─── Earnings ──────────────────────────────────────────────────────────────

  @Get('me/earnings')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rider earnings summary (today, week, month)' })
  getEarnings(@CurrentRider() rider: { sub: string }) {
    return this.ridersService.getEarnings(rider.sub)
  }

  // ─── Active Order ──────────────────────────────────────────────────────────

  @Get('me/active-order')
  @UseGuards(RiderAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current active delivery order (null if none)' })
  getActiveOrder(@CurrentRider() rider: { sub: string }) {
    return this.ridersService.getActiveOrder(rider.sub)
  }
}

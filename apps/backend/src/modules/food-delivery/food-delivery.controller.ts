import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { FoodDeliveryService } from './food-delivery.service'
import { SendCustomerOtpDto, VerifyCustomerOtpDto } from './dto/customer-otp.dto'
import { PlaceOrderDto } from './dto/place-order.dto'
import { CustomerAuthGuard } from './guards/customer-auth.guard'
import { CurrentCustomer } from './decorators/current-customer.decorator'

interface CustomerPayload {
  sub: string
  type: 'customer'
}

interface ValidatePromoBody {
  code: string
  subtotalPaise: number
}

@ApiTags('food-delivery')
@Controller('delivery')
export class FoodDeliveryController {
  constructor(private readonly foodDeliveryService: FoodDeliveryService) {}

  // ─── Auth ───────────────────────────────────────────────────────────────

  @Post('customers/auth/send-otp')
  @ApiOperation({ summary: 'Send OTP to customer phone' })
  sendOtp(@Body() dto: SendCustomerOtpDto) {
    return this.foodDeliveryService.sendOtp(dto)
  }

  @Post('customers/auth/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and receive JWT' })
  verifyOtp(@Body() dto: VerifyCustomerOtpDto) {
    return this.foodDeliveryService.verifyOtp(dto)
  }

  // ─── Restaurants ────────────────────────────────────────────────────────

  @Get('restaurants')
  @ApiOperation({ summary: 'List active restaurants/branches, optionally filtered by location' })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Customer latitude' })
  @ApiQuery({ name: 'lng', required: false, type: Number, description: 'Customer longitude' })
  getRestaurants(@Query() query: { lat?: number; lng?: number }) {
    return this.foodDeliveryService.getRestaurants(
      query.lat !== undefined ? Number(query.lat) : undefined,
      query.lng !== undefined ? Number(query.lng) : undefined,
    )
  }

  // ─── Menu ────────────────────────────────────────────────────────────────

  @Get('menu/:branchId')
  @ApiOperation({ summary: 'Get full menu for a branch' })
  getMenu(@Param('branchId') branchId: string) {
    return this.foodDeliveryService.getMenu(branchId)
  }

  // ─── Orders ─────────────────────────────────────────────────────────────

  @Post('orders/validate-promo')
  @ApiOperation({ summary: 'Validate a promo code (no auth required)' })
  validatePromo(@Body() body: ValidatePromoBody) {
    return this.foodDeliveryService.validatePromo(body.code, body.subtotalPaise)
  }

  @Post('orders')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new delivery order' })
  placeOrder(
    @CurrentCustomer() customer: CustomerPayload,
    @Body() dto: PlaceOrderDto,
  ) {
    return this.foodDeliveryService.placeOrder(customer.sub, dto)
  }

  @Get('orders')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders for the authenticated customer' })
  getCustomerOrders(@CurrentCustomer() customer: CustomerPayload) {
    return this.foodDeliveryService.getCustomerOrders(customer.sub)
  }

  @Get('orders/:id')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single order by ID' })
  getOrder(
    @CurrentCustomer() customer: CustomerPayload,
    @Param('id') orderId: string,
  ) {
    return this.foodDeliveryService.getOrder(customer.sub, orderId)
  }
}

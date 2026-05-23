import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../../database/prisma.module'
import { FoodDeliveryController } from './food-delivery.controller'
import { FoodDeliveryService } from './food-delivery.service'
import { CustomerAuthGuard } from './guards/customer-auth.guard'
import { RestaurantAuthGuard } from './guards/restaurant-auth.guard'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
    }),
  ],
  controllers: [FoodDeliveryController],
  providers: [FoodDeliveryService, CustomerAuthGuard, RestaurantAuthGuard],
  exports: [FoodDeliveryService],
})
export class FoodDeliveryModule {}

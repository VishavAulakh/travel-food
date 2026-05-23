import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../../database/prisma.module'
import { FoodDeliveryController } from './food-delivery.controller'
import { FoodDeliveryService } from './food-delivery.service'
import { CustomerAuthGuard } from './guards/customer-auth.guard'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
    }),
  ],
  controllers: [FoodDeliveryController],
  providers: [FoodDeliveryService, CustomerAuthGuard],
  exports: [FoodDeliveryService],
})
export class FoodDeliveryModule {}

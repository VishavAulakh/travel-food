import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../../database/prisma.module'
import { ZonesController } from './zones.controller'
import { ZonesService } from './zones.service'
import { RestaurantAuthGuard } from './guards/restaurant-auth.guard'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
    }),
  ],
  controllers: [ZonesController],
  providers: [ZonesService, RestaurantAuthGuard],
  exports: [ZonesService],
})
export class ZonesModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './database/prisma.module'
import { FoodDeliveryModule } from './modules/food-delivery/food-delivery.module'
import { RidersModule } from './modules/riders/riders.module'
import { ZonesModule } from './modules/zones/zones.module'
import { TrackingModule } from './modules/tracking/tracking.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'auth', ttl: 60000, limit: 10 },
      { name: 'api', ttl: 60000, limit: 500 },
    ]),
    PrismaModule,
    FoodDeliveryModule,
    RidersModule,
    ZonesModule,
    TrackingModule,
  ],
})
export class AppModule {}

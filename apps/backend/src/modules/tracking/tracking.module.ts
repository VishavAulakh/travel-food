import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TrackingGateway } from './tracking.gateway'
import { TrackingService } from './tracking.service'
import { RedisService } from '../../common/services/redis.service'

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET ?? 'travel-food-local-secret' }),
  ],
  providers: [TrackingGateway, TrackingService, RedisService],
  exports: [TrackingGateway, TrackingService],
})
export class TrackingModule {}

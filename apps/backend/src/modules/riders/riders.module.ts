import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../../database/prisma.module'
import { RedisService } from '../../common/services/redis.service'
import { RidersController } from './riders.controller'
import { RidersService } from './riders.service'
import { RiderAuthGuard } from './guards/rider-auth.guard'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
    }),
  ],
  controllers: [RidersController],
  providers: [RidersService, RiderAuthGuard, RedisService],
  exports: [RidersService],
})
export class RidersModule {}

import { Injectable } from '@nestjs/common'
import { RedisService } from '../../common/services/redis.service'

@Injectable()
export class TrackingService {
  constructor(private readonly redis: RedisService) {}

  async getRiderLocation(riderId: string): Promise<{ lat: number; lng: number; ts: number } | null> {
    const raw = await this.redis.get(`rider:location:${riderId}`)
    return raw ? JSON.parse(raw) : null
  }
}

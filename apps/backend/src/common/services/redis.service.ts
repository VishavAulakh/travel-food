import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client = new Redis({
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  })

  private async ensureConnected() {
    if (this.client.status === 'wait') await this.client.connect()
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnected()
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.ensureConnected()
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.ensureConnected()
    await this.client.del(key)
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') await this.client.quit()
  }
}

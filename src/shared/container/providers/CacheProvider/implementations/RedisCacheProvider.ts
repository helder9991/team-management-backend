import Redis, { type Redis as RedisClient } from 'ioredis'

import type ICacheProvider from '../interfaces/ICacheProvider'
import cacheConfig from '../../../../config/cache'

export default class RedisCacheProvider implements ICacheProvider {
  private readonly client: RedisClient

  constructor() {
    this.client = new Redis(cacheConfig.config.redis)
  }

  public async save(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value))
  }

  public async recover<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key)

    if (data === null) return null

    const parsedData = JSON.parse(data) as T

    return parsedData
  }

  public async invalidate(key: string): Promise<void> {
    await this.client.del(key)
  }

  public async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(`${prefix}:*`)

    const pipeline = this.client.pipeline()

    keys.forEach((key) => pipeline.del(key))

    await pipeline.exec()
  }
}

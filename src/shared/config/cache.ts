import { type RedisOptions } from 'ioredis'

interface ICacheConfig {
  driver: 'redis'

  config: {
    redis: RedisOptions
  }
}

const cacheConfig: ICacheConfig = {
  driver: 'redis',

  config: {
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) ?? 6379,
      password: process.env.REDIS_PASS ?? undefined,
    },
  },
}

export default cacheConfig

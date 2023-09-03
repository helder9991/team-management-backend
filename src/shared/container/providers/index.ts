import { container } from 'tsyringe'
import type ICacheProvider from './CacheProvider/interfaces/ICacheProvider'
import RedisCacheProvider from './CacheProvider/implementations/RedisCacheProvider'

const provider = {
  redis: RedisCacheProvider,
}

container.registerSingleton<ICacheProvider>('CacheProvider', provider.redis)

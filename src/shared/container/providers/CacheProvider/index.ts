import { container } from 'tsyringe'

import type ICacheProvider from './models/ICacheProvider'
import RedisCacheProvider from './implementations/RedisCacheProvider'

const provider = {
  redis: RedisCacheProvider,
}

container.registerSingleton<ICacheProvider>('CacheProvider', provider.redis)

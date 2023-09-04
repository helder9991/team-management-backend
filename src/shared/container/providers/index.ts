import { container } from 'tsyringe'
import type ICacheProvider from './CacheProvider/interfaces/ICacheProvider'
import RedisCacheProvider from './CacheProvider/implementations/RedisCacheProvider'
import MailProvider from './MailProvider/implementations/ethereal/MailProvider'
import type IMailProvider from './MailProvider/interfaces/IMailProvider'
import MailQueueProvider from './MailQueueProvider/implementations/MailQueueProvider'
import type IMailQueueProvider from './MailQueueProvider/interfaces/IMailQueueProvider'

container.registerSingleton<ICacheProvider>('CacheProvider', RedisCacheProvider)
container.registerSingleton<IMailProvider>('MailProvider', MailProvider)
container.registerInstance<IMailQueueProvider>(
  'MailQueueProvider',
  container.resolve(MailQueueProvider),
)

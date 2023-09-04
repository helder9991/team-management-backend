import { type Job } from 'bull'
import type ISendMailDTO from '../../MailProvider/dtos/ISendMailDTO'

export default interface IMailQueueProvider {
  addToQueue: (data: ISendMailDTO) => Promise<void>
  startQueueProcessing: () => Promise<void>
  processEmail: (job: Job<ISendMailDTO>) => Promise<void>
}

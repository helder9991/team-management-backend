import Queue, { type Job, type Queue as QueueType } from 'bull'
import bullConfig from 'shared/config/bull'
import IMailProvider from '../../MailProvider/interfaces/IMailProvider'
import { inject, injectable } from 'tsyringe'
import type IMailQueueProvider from '../interfaces/IMailQueueProvider'
import type ISendMailDTO from '../../MailProvider/dtos/ISendMailDTO'

@injectable()
class MailQueueProvider implements IMailQueueProvider {
  private readonly emailQueue: QueueType

  constructor(
    @inject('MailProvider')
    private readonly mailProvider: IMailProvider,
  ) {
    this.emailQueue = new Queue('emailQueue', {
      redis: {
        host: bullConfig.host,
        port: bullConfig.port,
        password: bullConfig.password,
      },
    })
  }

  async startQueueProcessing(): Promise<void> {
    console.log('Mail worker started.')
    await this.emailQueue.process(async (job) => {
      await this.processEmail(job)
    })
  }

  async processEmail(job: Job<ISendMailDTO>): Promise<void> {
    const { to, subject, text, from } = job.data

    await this.mailProvider.sendMail({ to, subject, from, text })
  }

  async addToQueue(data: ISendMailDTO): Promise<void> {
    const oneMinuteInMiliseconds = 1000 * 60

    await this.emailQueue.add(data, {
      attempts: 10,
      backoff: {
        type: 'exponential',
        delay: oneMinuteInMiliseconds,
      },
      removeOnComplete: true,
    })
  }
}

export default MailQueueProvider

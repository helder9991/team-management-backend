import { type Job } from 'bull'

import type IMailQueueProvider from '../interfaces/IMailQueueProvider'
import type IMailProvider from '../../MailProvider/interfaces/IMailProvider'
import type ISendMailDTO from '../../MailProvider/dtos/ISendMailDTO'

export default class FakeMailQueueProvider implements IMailQueueProvider {
  private readonly emailQueue: Array<Job<ISendMailDTO>> = []

  constructor(private readonly mailProvider: IMailProvider) {}

  async startQueueProcessing(): Promise<void> {
    console.log('Mail worker started.')

    while (this.emailQueue.length > 0) {
      const sendEmail: Job<ISendMailDTO> | undefined = this.emailQueue.shift()

      if (sendEmail === undefined) return

      await this.processEmail(sendEmail)
    }
  }

  async processEmail(job: Job<ISendMailDTO>): Promise<void> {
    const { to, subject, text, from } = job.data

    await this.mailProvider.sendMail({ to, subject, from, text })
  }

  async addToQueue(data: ISendMailDTO): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const dataFormated = { data } as Job<ISendMailDTO>
    this.emailQueue.push(dataFormated)
  }
}

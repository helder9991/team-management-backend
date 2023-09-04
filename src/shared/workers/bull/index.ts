import 'reflect-metadata'
import 'dotenv/config'
import MailProvider from 'shared/container/providers/MailProvider/implementations/ethereal/MailProvider'
import MailQueueProvider from 'shared/container/providers/MailQueueProvider/implementations/MailQueueProvider'

async function run(): Promise<void> {
  const mailProvider = new MailProvider()
  const emailWorker = new MailQueueProvider(mailProvider)
  await emailWorker.startQueueProcessing()
}

run()

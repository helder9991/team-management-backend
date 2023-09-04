import nodemailer, { type Transporter } from 'nodemailer'

import type ISendMailDTO from '../../dtos/ISendMailDTO'
import type IMailProvider from '../../interfaces/IMailProvider'

class MailProvider implements IMailProvider {
  private client: Transporter

  constructor() {
    nodemailer.createTestAccount().then((account) => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      })

      this.client = transporter
    })
  }

  public async sendMail({
    to,
    subject,
    from,
    text,
  }: ISendMailDTO): Promise<void> {
    const toFormated = to.map((to) => ({ name: to.name, address: to.email }))
    const message = await this.client.sendMail({
      from: {
        name: from.name,
        address: from.email,
      },
      to: toFormated,
      subject,
      text,
    })

    console.log('Message send: %s', message.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message))
  }
}

export default MailProvider

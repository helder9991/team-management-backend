import typeORMConnection from 'database/typeorm'
import AppError from './AppError'
import User from 'modules/users/entities/User'
import { Not } from 'typeorm'

async function clearTablesInTest(): Promise<void> {
  if (process.env.NODE_ENV !== 'test')
    throw new AppError(
      'Está função so deve ser rodada em ambiente de testes',
      500,
    )

  if (!typeORMConnection.isInitialized) await typeORMConnection.initialize()

  // delete all users except admin
  const admin = await typeORMConnection
    .getRepository(User)
    .findOneBy({ email: 'admin@team.com.br' })
  if (admin === null) {
    console.error('User admin not found')
    return
  }
  await typeORMConnection.getRepository(User).delete({ id: Not(admin.id) })
}

export default clearTablesInTest

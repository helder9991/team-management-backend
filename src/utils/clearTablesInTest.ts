import typeORMConnection from 'database/typeorm'
import AppError from './AppError'
import User from 'modules/users/entities/User'

async function clearTablesInTest(): Promise<void> {
  if (process.env.NODE_ENV !== 'test')
    throw new AppError(
      'Está função so deve ser rodada em ambiente de testes',
      500,
    )

  if (!typeORMConnection.isInitialized) await typeORMConnection.initialize()

  typeORMConnection.getRepository(User).delete({})
}

export default clearTablesInTest

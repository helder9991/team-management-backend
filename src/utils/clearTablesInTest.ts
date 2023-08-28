import typeORMConnection from 'database/typeorm'
import AppError from './AppError'

async function clearTablesInTest(): Promise<void> {
  if (process.env.NODE_ENV !== 'test')
    throw new AppError(
      'Está função so deve ser rodada em ambiente de testes',
      500,
    )

  if (!typeORMConnection.isInitialized) await typeORMConnection.initialize()
}

export default clearTablesInTest

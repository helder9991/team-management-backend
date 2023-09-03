import typeORMConnection from 'shared/database/typeorm'
import { type NextFunction, type Request, type Response } from 'express'

async function initializeDatabaseConnection(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!typeORMConnection.isInitialized) {
    try {
      await typeORMConnection.initialize()
    } catch (err) {
      console.error(err)
    }
  }

  next()
}

export default initializeDatabaseConnection

import { type NextFunction, type Request, type Response } from 'express'
import AppError from 'utils/AppError'

function handleErrors(
  err: Error,
  _req: Request,
  res: Response,
  _: NextFunction,
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }
  console.log(err)

  return res.status(500).json({
    message: 'Internal Server error',
  })
}

export default handleErrors

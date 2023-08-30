import { type Response, type Request, type NextFunction } from 'express'
import { type JwtPayload, verify } from 'jsonwebtoken'

import authConfig from '../config/auth'
import AppError from 'utils/AppError'
import typeORMConnection from 'database/typeorm'
import User from 'modules/users/entities/User'

type Payload = JwtPayload & {
  roleId: string
}

export default async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (authHeader === undefined) throw new AppError('JWT token is missing.', 401)

  const [, token] = authHeader.split(' ')
  const decoded = verify(token, authConfig.jwt.secret)

  const { sub, roleId } = decoded as Payload

  const userRepository = typeORMConnection.getRepository(User)

  const user = await userRepository.findOneBy({ id: sub })

  if (user === null || user.deletedAt !== null)
    throw new AppError('User doesn`t exist.', 401)

  if (typeof sub === 'string') {
    req.user = {
      id: sub,
      roleId,
    }
  }

  next()
}

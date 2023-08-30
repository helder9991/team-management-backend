import { type Response, type Request, type NextFunction } from 'express'

import AppError from 'utils/AppError'
import typeORMConnection from 'database/typeorm'
import UserRole from 'modules/users/entities/UserRole'

export default async function ensureAdministrator(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userRoleRepository = typeORMConnection.getRepository(UserRole)

  const userRole = await userRoleRepository.findOneBy({ id: req.user.roleId })

  if (userRole === null) throw new AppError('Missing RoleId.', 400)

  if (userRole.name !== 'Administrador')
    throw new AppError(
      'This user doesn`t have permission to do this action.',
      401,
    )

  next()
}

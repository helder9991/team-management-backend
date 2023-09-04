import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import ListUsersRoleUseCase from 'modules/users/useCases/ListUsersRole/ListUsersRoleUseCase'
import type UserRole from 'modules/users/entities/UserRole'

export interface IListUsersRoleControllerResponse {
  usersRole: UserRole[]
}

class ListUsersRoleController {
  async handle(req: Request, res: Response): Promise<Response> {
    const listUsersRoleUseCase: ListUsersRoleUseCase =
      container.resolve(ListUsersRoleUseCase)

    const usersRole = await listUsersRoleUseCase.execute()

    return res.status(200).json({ usersRole })
  }
}

export default new ListUsersRoleController()

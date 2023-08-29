import { type Request, type Response } from 'express'
import type User from 'modules/users/entities/User'
import ListUsersUseCase from 'modules/users/useCases/ListUsers/ListUsersUseCase'
import { container } from 'tsyringe'

export type IListUsersControllerResponse = Array<Omit<User, 'password'>>

class ListUsersController {
  async handle(req: Request, res: Response): Promise<Response> {
    const listUsersUseCase: ListUsersUseCase =
      container.resolve(ListUsersUseCase)

    const users = await listUsersUseCase.execute()

    return res.status(200).json(users)
  }
}

export default new ListUsersController()

import { type Request, type Response } from 'express'
import type User from 'modules/users/entities/User'
import ListUsersUseCase from 'modules/users/useCases/ListUsers/ListUsersUseCase'
import { container } from 'tsyringe'
import { type ParsedQs } from 'qs'
import * as Yup from 'yup'
import AppError from 'utils/AppError'

export interface IListUsersControllerResponse {
  users: Array<Omit<User, 'password'>>
  savedItemCount: number
}

interface IQueryRequest extends ParsedQs {
  page?: string
}

class ListUsersController {
  private readonly schema

  constructor() {
    this.schema = Yup.object().shape({
      page: Yup.number().positive(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { page = 1 } = req.query as IQueryRequest

    if (!(await this.schema.isValid({ page })))
      throw new AppError('Validation Fails', 400)

    const listUsersUseCase: ListUsersUseCase =
      container.resolve(ListUsersUseCase)

    const [users, savedItemCount] = await listUsersUseCase.execute({
      page: Number(page),
    })

    return res.status(200).json({ users, savedItemCount })
  }
}

export default new ListUsersController()

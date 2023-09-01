import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import { type ParsedQs } from 'qs'
import * as Yup from 'yup'
import AppError from 'utils/AppError'
import type Task from 'modules/tasks/entities/Task'
import ListTasksUseCase from 'modules/tasks/useCases/ListTasks/ListTasksUseCase'

export interface IListTasksControllerResponse {
  tasks: Task[]
  savedItemCount: number
}

interface IQueryRequest extends ParsedQs {
  page?: string
}

class ListTasksController {
  private readonly schema

  constructor() {
    this.schema = Yup.object().shape({
      page: Yup.number().positive(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { page = 1 } = req.query as IQueryRequest

    if (!(await this.schema.isValid({ page })))
      throw new AppError('Validation Fails.', 400)

    const listTasksUseCase: ListTasksUseCase =
      container.resolve(ListTasksUseCase)

    const [tasks, savedItemCount] = await listTasksUseCase.execute({
      page: Number(page),
    })

    return res.status(200).json({ tasks, savedItemCount })
  }
}

export default new ListTasksController()

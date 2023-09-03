import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import { type ParsedQs } from 'qs'
import * as Yup from 'yup'
import AppError from 'shared/utils/AppError'
import type Task from 'modules/tasks/entities/Task'
import ListTasksUseCase from 'modules/tasks/useCases/ListTasks/ListTasksUseCase'

export interface IListTasksControllerResponse {
  tasks: Task[]
  savedItemCount: number
}

interface IQueryRequest extends ParsedQs {
  page?: string
  projectId: string
  taskStatusId: string
  userId: string
  taskPriorityId: string
}

class ListTasksController {
  private readonly schema

  constructor() {
    this.schema = Yup.object().shape({
      page: Yup.number().positive(),
      projectId: Yup.string().strict().required(),
      userTeamId: Yup.string().strict().required(),
      taskStatusId: Yup.string().strict(),
      taskPriorityId: Yup.string().strict(),
      userId: Yup.string().strict(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const {
      page = 1,
      projectId,
      userId,
      taskStatusId,
      taskPriorityId,
    } = req.query as IQueryRequest
    const userTeamId = req.user.teamId as string

    if (
      !(await this.schema.isValid({
        page,
        userTeamId,
        projectId,
        userId,
        taskStatusId,
        taskPriorityId,
      }))
    )
      throw new AppError('Validation Fails.', 400)

    const listTasksUseCase: ListTasksUseCase =
      container.resolve(ListTasksUseCase)

    const [tasks, savedItemCount] = await listTasksUseCase.execute({
      page: Number(page),
      projectId,
      userTeamId,
      userId,
      taskStatusId,
      taskPriorityId,
    })

    return res.status(200).json({ tasks, savedItemCount })
  }
}

export default new ListTasksController()

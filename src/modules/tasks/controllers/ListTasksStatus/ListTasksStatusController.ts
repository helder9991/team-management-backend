import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import ListTasksStatusUseCase from 'modules/tasks/useCases/ListTasksStatus/ListTasksStatusUseCase'
import type TaskStatus from 'modules/tasks/entities/TaskStatus'

export interface IListTasksStatusControllerResponse {
  tasksStatus: TaskStatus[]
}

class ListTasksStatusController {
  async handle(req: Request, res: Response): Promise<Response> {
    const listTasksStatusUseCase: ListTasksStatusUseCase = container.resolve(
      ListTasksStatusUseCase,
    )

    const tasksStatus = await listTasksStatusUseCase.execute()

    return res.status(200).json({ tasksStatus })
  }
}

export default new ListTasksStatusController()

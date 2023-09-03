import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import type TaskPriority from 'modules/tasks/entities/TaskPriority'
import ListTasksPriorityUseCase from 'modules/tasks/useCases/ListTasksPriority/ListTasksPriorityUseCase'

export interface IListTasksPriorityControllerResponse {
  tasksPriority: TaskPriority[]
}

class ListTasksPriorityController {
  async handle(req: Request, res: Response): Promise<Response> {
    const listTasksPriorityUseCase: ListTasksPriorityUseCase =
      container.resolve(ListTasksPriorityUseCase)

    const tasksPriority = await listTasksPriorityUseCase.execute()

    return res.status(200).json({ tasksPriority })
  }
}

export default new ListTasksPriorityController()

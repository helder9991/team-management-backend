import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'
import UpdateTaskUseCase from 'modules/tasks/useCases/UpdateTask/UpdateTaskUseCase'

export interface IUpdateTaskControllerResponse {
  id: string
  name: string
  description: string
  taskPriorityId: string
}

class UpdateTaskController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      id: Yup.string().uuid().required(),
      name: Yup.string().strict(),
      description: Yup.string().strict(),
      taskPriorityId: Yup.string().uuid(),
      userTeamId: Yup.string().uuid().required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    let { name, description, taskPriorityId } = req.body
    const userTeamId = req.user.teamId as string

    if (
      !(await this.schema.isValid(
        trimObjectValues({ id, name, description, taskPriorityId, userTeamId }),
      ))
    )
      throw new AppError('Validation Fails.', 400)

    const updateTaskUseCase: UpdateTaskUseCase =
      container.resolve(UpdateTaskUseCase)

    ;({ name, description, taskPriorityId } = await updateTaskUseCase.execute({
      id,
      name,
      description,
      taskPriorityId,
      userTeamId,
    }))

    return res.status(200).json({
      id,
      name,
      description,
      taskPriorityId,
    })
  }
}

export default new UpdateTaskController()

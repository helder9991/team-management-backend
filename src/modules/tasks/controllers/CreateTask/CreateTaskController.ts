import { type Request, type Response } from 'express'
import CreateTaskUseCase from 'modules/tasks/useCases/CreateTask/CreateTaskUseCase'
import { container } from 'tsyringe'
import AppError from 'utils/AppError'
import { trimObjectValues } from 'utils/trimObjectValues'
import * as Yup from 'yup'

export interface ICreateTaskControllerResponse {
  id: string
  name: string
  description: string | null
  projectId: string
}

class CreateTaskController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      name: Yup.string().strict().required(),
      description: Yup.string().strict(),
      projectId: Yup.string().uuid().required(),
      userTeamId: Yup.string().uuid().required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { name, description, projectId } = req.body
    const userTeamId = req.user.teamId as string

    if (
      !(await this.schema.isValid(
        trimObjectValues({ name, description, projectId, userTeamId }),
      ))
    )
      throw new AppError('Validation Fails.', 400)

    const createTaskUseCase: CreateTaskUseCase =
      container.resolve(CreateTaskUseCase)

    const { id } = await createTaskUseCase.execute({
      name,
      description,
      projectId,
      userTeamId,
    })

    return res.status(201).json({
      id,
      name,
      description,
      projectId,
    })
  }
}

export default new CreateTaskController()

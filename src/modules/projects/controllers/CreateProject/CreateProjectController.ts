import { type Request, type Response } from 'express'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'

export interface ICreateProjectControllerResponse {
  id: string
  name: string
  teamId: string
}

class CreateProjectController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      name: Yup.string().strict().required(),
      teamId: Yup.string().uuid().required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { name, teamId } = req.body

    if (!(await this.schema.isValid(trimObjectValues({ name, teamId }))))
      throw new AppError('Validation Fails.', 400)

    const createProjectUseCase: CreateProjectUseCase =
      container.resolve(CreateProjectUseCase)

    const { id } = await createProjectUseCase.execute({ name, teamId })

    return res.status(201).json({
      id,
      name,
      teamId,
    })
  }
}

export default new CreateProjectController()

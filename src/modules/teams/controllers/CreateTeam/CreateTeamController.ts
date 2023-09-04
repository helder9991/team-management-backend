import { type Request, type Response } from 'express'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'

export interface ICreateTeamControllerResponse {
  id: string
  name: string
}

class CreateTeamController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      name: Yup.string().strict().required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { name } = req.body

    if (!(await this.schema.isValid(trimObjectValues({ name }))))
      throw new AppError('Validation Fails.', 400)

    const createTeamUseCase: CreateTeamUseCase =
      container.resolve(CreateTeamUseCase)

    const { id } = await createTeamUseCase.execute({ name })

    return res.status(201).json({
      id,
      name,
    })
  }
}

export default new CreateTeamController()

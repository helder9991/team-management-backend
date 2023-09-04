import { type Request, type Response } from 'express'
import UpdateTeamUseCase from 'modules/teams/useCases/UpdateTeam/UpdateTeamUseCase'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'

export interface IUpdateTeamControllerResponse {
  id: string
  name: string
  roleId: string
  teamId: string
}

class UpdateTeamController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      id: Yup.string().uuid().required(),
      name: Yup.string().strict(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    let { name } = req.body

    if (!(await this.schema.isValid(trimObjectValues({ id, name }))))
      throw new AppError('Validation Fails.', 400)

    const updateTeamUseCase: UpdateTeamUseCase =
      container.resolve(UpdateTeamUseCase)

    ;({ name } = await updateTeamUseCase.execute({
      id,
      name,
    }))

    return res.status(200).json({
      id,
      name,
    })
  }
}

export default new UpdateTeamController()

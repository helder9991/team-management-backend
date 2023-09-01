import { type Request, type Response } from 'express'
import UpdateProjectUseCase from 'modules/projects/useCases/UpdateProject/UpdateProjectUseCase'
import { container } from 'tsyringe'
import AppError from 'utils/AppError'
import { trimObjectValues } from 'utils/trimObjectValues'
import * as Yup from 'yup'

export interface IUpdateProjectControllerResponse {
  id: string
  name: string
  teamId: string
}

class UpdateProjectController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      id: Yup.string().uuid().required(),
      name: Yup.string().strict(),
      teamId: Yup.string().uuid(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    let { name, teamId } = req.body

    if (!(await this.schema.isValid(trimObjectValues({ id, name, teamId }))))
      throw new AppError('Validation Fails.', 400)

    const updateProjectUseCase: UpdateProjectUseCase =
      container.resolve(UpdateProjectUseCase)

    ;({ name } = await updateProjectUseCase.execute({
      id,
      name,
      teamId,
    }))

    return res.status(200).json({
      id,
      name,
      teamId,
    })
  }
}

export default new UpdateProjectController()

import { type Request, type Response } from 'express'
import UpdateUserUseCase from 'modules/users/useCases/UpdateUser/UpdateUserUseCase'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'

export interface IUpdateUserControllerResponse {
  id: string
  name: string
  roleId: string
  teamId: string
}

class UpdateUserController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      id: Yup.string().uuid().required(),
      name: Yup.string(),
      password: Yup.string().min(8),
      roleId: Yup.string().uuid(),
      teamId: Yup.string().uuid(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    let { name, password, roleId, teamId } = req.body

    if (
      !(await this.schema.isValid(
        trimObjectValues({ id, name, password, roleId, teamId }),
      ))
    )
      throw new AppError('Validation Fails.', 400)

    const updateUserUseCase: UpdateUserUseCase =
      container.resolve(UpdateUserUseCase)

    ;({ name, roleId, teamId } = await updateUserUseCase.execute({
      id,
      name,
      password,
      roleId,
      teamId,
    }))

    return res.status(200).json({
      id,
      name,
      roleId,
      teamId,
    })
  }
}

export default new UpdateUserController()

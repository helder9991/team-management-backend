import { type Request, type Response } from 'express'
import DeleteUserUseCase from 'modules/users/useCases/DeleteUser/DeleteUserUseCase'
import { container } from 'tsyringe'
import AppError from 'utils/AppError'
import { trimObjectValues } from 'utils/trimObjectValues'
import * as Yup from 'yup'

class DeleteUserController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      id: Yup.string().uuid().required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params

    if (!(await this.schema.isValid(trimObjectValues({ id }))))
      throw new AppError('Validation Fails.', 400)

    const deleteUserUseCase: DeleteUserUseCase =
      container.resolve(DeleteUserUseCase)

    await deleteUserUseCase.execute({ id })

    return res.status(204).json()
  }
}

export default new DeleteUserController()

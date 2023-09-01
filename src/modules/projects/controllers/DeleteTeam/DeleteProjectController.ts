import { type Request, type Response } from 'express'
import DeleteProjectUseCase from 'modules/projects/useCases/DeleteProject/DeleteProjectUseCase'
import { container } from 'tsyringe'
import AppError from 'utils/AppError'
import { trimObjectValues } from 'utils/trimObjectValues'
import * as Yup from 'yup'

class DeleteProjectController {
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

    const deleteProjectUseCase: DeleteProjectUseCase =
      container.resolve(DeleteProjectUseCase)

    await deleteProjectUseCase.execute({ id })

    return res.status(204).json()
  }
}

export default new DeleteProjectController()

import { type Request, type Response } from 'express'
import DeleteTaskUseCase from 'modules/tasks/useCases/DeleteTask/DeleteTaskUseCase'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'

class DeleteTaskController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      id: Yup.string().uuid().required(),
      userTeamId: Yup.string().uuid().required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    const userTeamId = req.user.teamId as string

    if (!(await this.schema.isValid(trimObjectValues({ id, userTeamId }))))
      throw new AppError('Validation Fails.', 400)

    const deleteTaskUseCase: DeleteTaskUseCase =
      container.resolve(DeleteTaskUseCase)

    await deleteTaskUseCase.execute({ id, userTeamId })

    return res.status(204).json()
  }
}

export default new DeleteTaskController()

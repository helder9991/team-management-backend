import { type Request, type Response } from 'express'
import InProgressTaskUseCase from 'modules/tasks/useCases/InProgressTask/InProgressTaskUseCase'
import { container } from 'tsyringe'
import AppError from 'utils/AppError'
import { trimObjectValues } from 'utils/trimObjectValues'
import * as Yup from 'yup'

class InProgressTaskController {
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

    const inProgressTaskUseCase: InProgressTaskUseCase = container.resolve(
      InProgressTaskUseCase,
    )

    await inProgressTaskUseCase.execute({
      id,
      userTeamId,
    })

    return res.status(204).send()
  }
}

export default new InProgressTaskController()

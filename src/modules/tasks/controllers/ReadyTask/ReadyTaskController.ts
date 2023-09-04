import { type Request, type Response } from 'express'
import ReadyTaskUseCase from 'modules/tasks/useCases/ReadyTask/ReadyTaskUseCase'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'

class ReadyTaskController {
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

    const readyTaskUseCase: ReadyTaskUseCase =
      container.resolve(ReadyTaskUseCase)

    await readyTaskUseCase.execute({
      id,
      userTeamId,
    })

    return res.status(204).send()
  }
}

export default new ReadyTaskController()

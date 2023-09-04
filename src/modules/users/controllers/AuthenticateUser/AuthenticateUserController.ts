import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import { trimObjectValues } from 'shared/utils/trimObjectValues'
import * as Yup from 'yup'
import AuthenticateUserUseCase from '../../useCases/AuthenticateUser/AuthenticateUserUseCase'

export interface IAuthenticateUserControllerResponse {
  token: string
}

class AuthenticateUserController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body

    if (!(await this.schema.isValid(trimObjectValues({ email, password }))))
      throw new AppError('Validation Fails.', 400)

    const authenticateUserUseCase: AuthenticateUserUseCase = container.resolve(
      AuthenticateUserUseCase,
    )

    const { token } = await authenticateUserUseCase.execute({ email, password })

    return res.status(201).json({
      token,
    })
  }
}

export default new AuthenticateUserController()

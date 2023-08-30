import { type Request, type Response } from 'express'
import CreateUserUseCase from 'modules/users/useCases/CreateUser/CreateUserUseCase'
import { container } from 'tsyringe'
import AppError from 'utils/AppError'
import { trimObjectValues } from 'utils/trimObjectValues'
import * as Yup from 'yup'

export interface ICreateUserControllerResponse {
  id: string
  name: string
  email: string
  roleId: string
  teamId: string
}

class CreateUserController {
  private readonly schema: Yup.ObjectSchema<any>

  constructor() {
    this.schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required(),
      roleId: Yup.string().uuid().required(),
      teamId: Yup.string().uuid(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { name, email, password, roleId, teamId } = req.body

    if (
      !(await this.schema.isValid(
        trimObjectValues({ name, email, password, roleId, teamId }),
      ))
    )
      throw new AppError('Validation Fails.', 400)

    const createUserUseCase: CreateUserUseCase =
      container.resolve(CreateUserUseCase)

    const { id } = await createUserUseCase.execute({
      name,
      email,
      password,
      roleId,
      teamId,
    })

    return res.status(201).json({
      id,
      name,
      email,
      roleId,
      teamId: teamId ?? null,
    })
  }
}

export default new CreateUserController()

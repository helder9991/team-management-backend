import type User from 'modules/users/entities/User'
import IAuthenticateRepository, {
  type IToken,
} from 'modules/users/repository/interfaces/IAuthenticateRepository'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IAuthenticateUserParams = Pick<User, 'email' | 'password'>

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('AuthenticateRepository')
    private readonly authenticateRepository: IAuthenticateRepository,
  ) {}

  async execute({ email, password }: IAuthenticateUserParams): Promise<IToken> {
    const userExists = await this.userRepository.findByEmail(email)

    if (userExists === null) throw new AppError('User doesn`t exist.', 400)

    const token = await this.authenticateRepository.create({
      id: userExists.id,
      roleId: userExists.roleId,
      password: userExists.password,
      recivedPassword: password,
    })

    return token
  }
}

export default AuthenticateUserUseCase

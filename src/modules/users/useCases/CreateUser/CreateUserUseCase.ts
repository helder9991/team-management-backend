import type User from 'modules/users/entities/User'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import IUserRoleRepository from 'modules/users/repository/interfaces/IUserRoleRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type ICreateUserParams = Omit<User, 'id' | 'createdAt' | 'deletedAt'>

@injectable()
class CreateUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute({
    name,
    email,
    password,
    roleId,
    teamId,
  }: ICreateUserParams): Promise<User> {
    const userExists = await this.userRepository.findByEmail(email)

    if (userExists !== null) throw new AppError('User already exists.', 400)

    const userRoleExists = await this.userRoleRepository.findById(roleId)

    if (userRoleExists === null)
      throw new AppError('User Role doesn`t exists.', 400)

    const user = await this.userRepository.create({
      name,
      email,
      password,
      roleId,
      teamId,
    })

    return user
  }
}

export default CreateUserUseCase

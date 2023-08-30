import { compare } from 'bcryptjs'
import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import type User from 'modules/users/entities/User'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import IUserRoleRepository from 'modules/users/repository/interfaces/IUserRoleRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IUpdateUserParams = Partial<
  Omit<User, 'email' | 'createdAt' | 'deletedAt'>
> & {
  id: string
}

@injectable()
class UpdateUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,

    @inject('UserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,

    @inject('TeamRepository')
    private readonly teamRepository: ITeamRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    id,
    name,
    password,
    roleId,
    teamId,
  }: IUpdateUserParams): Promise<User> {
    const userExists = await this.userRepository.findById(id)

    if (userExists === null) throw new AppError('User doesn`t exist.', 400)

    if (roleId !== undefined) {
      const userRoleExists = await this.userRoleRepository.findById(roleId)

      if (userRoleExists === null)
        throw new AppError('User Role doesn`t exist.', 400)
    }

    if (teamId !== undefined) {
      const teamExists = await this.teamRepository.findById(teamId)

      if (teamExists === null) throw new AppError('Team doesn`t exist.', 400)
    }

    const isNewPassword =
      password !== undefined
        ? !(await compare(password, userExists.password))
        : false

    const user = await this.userRepository.update({
      id,
      name: name !== undefined ? name : userExists.name,
      isNewPassword,
      password:
        password !== undefined && isNewPassword
          ? password
          : userExists.password,
      roleId: roleId !== undefined ? roleId : userExists.roleId,
      teamId: teamId !== undefined ? teamId : userExists.teamId,
    })

    await this.cacheProvider.invalidatePrefix('users-list')

    return user
  }
}

export default UpdateUserUseCase

import { container } from 'tsyringe'
import './providers'
import type IAuthenticateRepository from 'modules/users/repository/interfaces/IAuthenticateRepository'
import type IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import type IUserRoleRepository from 'modules/users/repository/interfaces/IUserRoleRepository'
import AuthenticateRepository from 'modules/users/repository/jwt/AuthenticateRepository'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'

container.registerSingleton<IUserRepository>('UserRepository', UserRepository)
container.registerSingleton<IUserRoleRepository>(
  'UserRoleRepository',
  UserRoleRepository,
)
container.registerSingleton<IAuthenticateRepository>(
  'AuthenticateRepository',
  AuthenticateRepository,
)
container.registerSingleton<ITeamRepository>('TeamRepository', TeamRepository)

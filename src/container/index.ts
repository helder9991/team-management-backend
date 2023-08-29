import type IAuthenticateRepository from 'modules/users/repository/interfaces/IAuthenticateRepository'
import type IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import type IUserRoleRepository from 'modules/users/repository/interfaces/IUserRoleRepository'
import AuthenticateRepository from 'modules/users/repository/jwt/AuthenticateRepository'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import { container } from 'tsyringe'

container.registerSingleton<IUserRepository>('UserRepository', UserRepository)
container.registerSingleton<IUserRoleRepository>(
  'UserRoleRepository',
  UserRoleRepository,
)
container.registerSingleton<IAuthenticateRepository>(
  'AuthenticateRepository',
  AuthenticateRepository,
)

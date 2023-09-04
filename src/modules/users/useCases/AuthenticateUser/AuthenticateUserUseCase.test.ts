import 'reflect-metadata'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import CreateUserUseCase from '../CreateUser/CreateUserUseCase'
import AuthenticateUserUseCase from './AuthenticateUserUseCase'
import AuthenticateRepository from 'modules/users/repository/jwt/AuthenticateRepository'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'

let authenticateUser: AuthenticateUserUseCase
let createUser: CreateUserUseCase
let userRepository: UserRepository
let userRoleRepository: UserRoleRepository
let authenticateRepository: AuthenticateRepository
let fakeCacheProvider: FakeCacheProvider
let roles: UserRole[] = []

const user = {
  name: 'John',
  email: 'john@mail.com',
  password: '123456789',
  roleId: '',
}

describe('Authenticate User', () => {
  beforeAll(async () => {
    try {
      userRepository = new UserRepository()
      authenticateRepository = new AuthenticateRepository()
      userRoleRepository = new UserRoleRepository()
      fakeCacheProvider = new FakeCacheProvider()
      authenticateUser = new AuthenticateUserUseCase(
        userRepository,
        authenticateRepository,
      )
      createUser = new CreateUserUseCase(
        userRepository,
        userRoleRepository,
        fakeCacheProvider,
      )

      await clearTablesInTest({})
      roles = await userRoleRepository.list()

      // Create User
      user.roleId = roles[0].id

      await createUser.execute(user)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to authenticate a existing user', async () => {
    const authenticated = await authenticateUser.execute({
      email: user.email,
      password: user.password,
    })

    expect(authenticated).toHaveProperty('token')
  })

  it('Shouldn`t be able to authenticate a non-existing user', async () => {
    const nonExistingUser = {
      email: 'non-existing-email',
      password: 'non-existing-password',
    }

    await expect(
      authenticateUser.execute(nonExistingUser),
    ).rejects.toHaveProperty('message', 'User doesn`t exist.')
  })

  it('Shouldn`t be able to authenticate with a wrong password', async () => {
    await expect(
      authenticateUser.execute({
        email: user.email,
        password: 'wrong-password',
      }),
    ).rejects.toHaveProperty('message', 'Login or password is invalid.')
  })
})

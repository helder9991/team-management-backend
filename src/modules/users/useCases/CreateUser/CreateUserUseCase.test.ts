import 'reflect-metadata'
import CreateUserUseCase from './CreateUserUseCase'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import clearTablesInTest from 'utils/clearTablesInTest'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import crypto from 'crypto'

let createUser: CreateUserUseCase
let userRepository: UserRepository
let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []

describe('Create User', () => {
  beforeAll(async () => {
    try {
      userRepository = new UserRepository()
      userRoleRepository = new UserRoleRepository()
      createUser = new CreateUserUseCase(userRepository, userRoleRepository)

      await clearTablesInTest()
      roles = await userRoleRepository.list()
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest()
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to create a new user', async () => {
    const user = {
      name: 'John',
      email: 'john@mail.com',
      password: '123456789',
      roleId: roles[0].id,
    }

    const createdUser = await createUser.execute(user)

    expect(createdUser).toMatchObject({
      name: 'John',
      email: 'john@mail.com',
      roleId: roles[0].id,
    })
  })

  it('Shouldn`t be able to create a user if the email already be used', async () => {
    const user = {
      name: 'John',
      email: 'john@mail.com',
      password: '123456789',
      roleId: roles[0].id,
    }

    await createUser.execute(user)

    await expect(createUser.execute(user)).rejects.toHaveProperty(
      'message',
      'User already exists.',
    )
  })

  it('Shouldn`t be able to create a user with a non-existing roleId', async () => {
    const user = {
      name: 'John',
      email: 'john@mail.com',
      password: '123456789',
      roleId: crypto.randomUUID(),
    }

    await expect(createUser.execute(user)).rejects.toHaveProperty(
      'message',
      'User Role doesn`t exists.',
    )
  })
})

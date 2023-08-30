import 'reflect-metadata'
import UpdateUserUseCase from './UpdateUserUseCase'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import clearTablesInTest from 'utils/clearTablesInTest'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import crypto from 'crypto'
import CreateUserUseCase from '../CreateUser/CreateUserUseCase'
import type User from 'modules/users/entities/User'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'

let updateUser: UpdateUserUseCase
let createUser: CreateUserUseCase
let userRepository: UserRepository
let userRoleRepository: UserRoleRepository
let fakeCacheProvider: FakeCacheProvider
let roles: UserRole[] = []
let createdUser: User

describe('Update User', () => {
  beforeAll(async () => {
    try {
      userRepository = new UserRepository()
      userRoleRepository = new UserRoleRepository()
      fakeCacheProvider = new FakeCacheProvider()
      updateUser = new UpdateUserUseCase(
        userRepository,
        userRoleRepository,
        fakeCacheProvider,
      )
      createUser = new CreateUserUseCase(
        userRepository,
        userRoleRepository,
        fakeCacheProvider,
      )

      await clearTablesInTest()
      roles = await userRoleRepository.list()
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest()
      const user = {
        name: 'John',
        email: 'john@mail.com',
        password: '123456789',
        roleId: roles[0].id,
      }

      createdUser = await createUser.execute(user)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a user', async () => {
    const userUpdated = {
      id: createdUser.id,
      name: 'Peter',
      email: 'peter@mail.com',
      password: 'peter123',
      roleId: roles[1].id,
    }

    const updatedUser = await updateUser.execute(userUpdated)
    await updateUser.execute({ id: userUpdated.id })
    await updateUser.execute({
      id: userUpdated.id,
      password: userUpdated.password,
    })

    expect(updatedUser).toMatchObject({
      id: createdUser.id,
      name: 'Peter',
      roleId: roles[1].id,
    })
  })

  it('Shouldn`t be able to update a non-existing user', async () => {
    const nonExistingUser = {
      id: 'non-existing-id',
    }

    await expect(updateUser.execute(nonExistingUser)).rejects.toHaveProperty(
      'message',
      'User doesn`t exist.',
    )
  })

  it('Shouldn`t be able to update a user with a non-existing roleId', async () => {
    const user = {
      id: createdUser.id,
      roleId: crypto.randomUUID(),
    }

    await expect(updateUser.execute(user)).rejects.toHaveProperty(
      'message',
      'User Role doesn`t exist.',
    )
  })
})

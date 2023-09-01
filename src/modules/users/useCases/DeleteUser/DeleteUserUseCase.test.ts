import 'reflect-metadata'
import DeleteUserUseCase from './DeleteUserUseCase'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import clearTablesInTest from 'utils/clearTablesInTest'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import CreateUserUseCase from '../CreateUser/CreateUserUseCase'
import type User from 'modules/users/entities/User'
import ListUsersUseCase from '../ListUsers/ListUsersUseCase'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'

let deleteUser: DeleteUserUseCase
let createUser: CreateUserUseCase
let listUsers: ListUsersUseCase
let userRepository: UserRepository
let userRoleRepository: UserRoleRepository
let fakeCacheProvider: FakeCacheProvider
let roles: UserRole[] = []
const createdUsers: User[] = []

describe('Delete User', () => {
  beforeAll(async () => {
    try {
      userRepository = new UserRepository()
      userRoleRepository = new UserRoleRepository()
      fakeCacheProvider = new FakeCacheProvider()
      deleteUser = new DeleteUserUseCase(userRepository, fakeCacheProvider)
      createUser = new CreateUserUseCase(
        userRepository,
        userRoleRepository,
        fakeCacheProvider,
      )
      listUsers = new ListUsersUseCase(userRepository, fakeCacheProvider)

      await clearTablesInTest({})
      roles = await userRoleRepository.list()
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({})

      createdUsers.push(
        await createUser.execute({
          name: 'John',
          email: 'john@mail.com',
          password: '123456789',
          roleId: roles[0].id,
        }),
      )
      createdUsers.push(
        await createUser.execute({
          name: 'Peter',
          email: 'peter@mail.com',
          password: '123456789',
          roleId: roles[1].id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing user', async () => {
    let [users] = await listUsers.execute({})

    expect(users).toHaveLength(3)

    await deleteUser.execute({ id: createdUsers[0].id })
    ;[users] = await listUsers.execute({})

    expect(users).toHaveLength(2)
  })

  it('Shouldn`t be able to delete a non-existing user', async () => {
    const nonExistingUser = {
      id: 'non-existing-id',
    }

    await expect(
      deleteUser.execute({ id: nonExistingUser.id }),
    ).rejects.toHaveProperty('message', 'User doesn`t exist.')
  })
})

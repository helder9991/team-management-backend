import 'reflect-metadata'
import ListUsersUseCase from './ListUsersUseCase'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import clearTablesInTest from 'utils/clearTablesInTest'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import CreateUserUseCase from '../CreateUser/CreateUserUseCase'
import type User from 'modules/users/entities/User'

let listUsers: ListUsersUseCase
let createUser: CreateUserUseCase
let userRepository: UserRepository
let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
const createdUsers: User[] = []

describe('List Users', () => {
  beforeAll(async () => {
    try {
      userRepository = new UserRepository()
      userRoleRepository = new UserRoleRepository()
      listUsers = new ListUsersUseCase(userRepository)
      createUser = new CreateUserUseCase(userRepository, userRoleRepository)

      await clearTablesInTest()
      roles = await userRoleRepository.list()

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
          password: '456123789',
          roleId: roles[1].id,
        }),
      )
      createdUsers.push(
        await createUser.execute({
          name: 'Mary',
          email: 'mary@mail.com',
          password: '789654321',
          roleId: roles[2].id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all users', async () => {
    const [users] = await listUsers.execute({})

    expect(users).toEqual(
      expect.arrayContaining(
        createdUsers.map(({ password, ...rest }) => {
          return { ...rest, password: undefined }
        }),
      ),
    )
  })
})

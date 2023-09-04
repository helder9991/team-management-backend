import 'reflect-metadata'
import ListUsersRoleUseCase from './ListUsersRoleUseCase'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { insertTasksPriorityName } from 'shared/database/typeorm/seeds/TasksPrioritySeed'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import { insertUsersRoleName } from 'shared/database/typeorm/seeds/UsersRolesSeed'

let listUsersRole: ListUsersRoleUseCase

let userRoleRepository: UserRoleRepository
let fakeCacheProvider: FakeCacheProvider

describe('List Users Roles', () => {
  beforeAll(async () => {
    try {
      await clearTablesInTest({})

      userRoleRepository = new UserRoleRepository()
      fakeCacheProvider = new FakeCacheProvider()

      listUsersRole = new ListUsersRoleUseCase(
        userRoleRepository,
        fakeCacheProvider,
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all users role', async () => {
    const usersRole = await listUsersRole.execute()

    expect(usersRole).toHaveLength(insertTasksPriorityName.length)
    expect(usersRole.map(({ name }) => name)).toEqual(insertUsersRoleName)
  })

  it('Should be able to list all users role in cache', async () => {
    await listUsersRole.execute()
    const usersRole = await listUsersRole.execute()

    expect(usersRole).toHaveLength(insertTasksPriorityName.length)
    expect(usersRole.map(({ name }) => name)).toEqual(insertUsersRoleName)
  })
})

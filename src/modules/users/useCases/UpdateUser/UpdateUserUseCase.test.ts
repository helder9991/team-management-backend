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
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'

let updateUser: UpdateUserUseCase
let createUser: CreateUserUseCase
let createTeam: CreateTeamUseCase

let userRepository: UserRepository
let teamRepository: TeamRepository
let userRoleRepository: UserRoleRepository
let fakeCacheProvider: FakeCacheProvider

let roles: UserRole[] = []

let createdUser: User
let createdTeam: Team

describe('Update User', () => {
  beforeAll(async () => {
    try {
      userRepository = new UserRepository()
      teamRepository = new TeamRepository()
      userRoleRepository = new UserRoleRepository()
      fakeCacheProvider = new FakeCacheProvider()

      updateUser = new UpdateUserUseCase(
        userRepository,
        userRoleRepository,
        teamRepository,
        fakeCacheProvider,
      )
      createUser = new CreateUserUseCase(
        userRepository,
        userRoleRepository,
        fakeCacheProvider,
      )
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest({})

      roles = await userRoleRepository.list()

      // Create User
      const user = {
        name: 'John',
        email: 'john@mail.com',
        password: '123456789',
        roleId: roles[0].id,
      }

      createdUser = await createUser.execute(user)

      // Create Team
      const team = {
        name: 'Team 1',
      }

      createdTeam = await createTeam.execute(team)
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

    await updateUser.execute(userUpdated)
    await updateUser.execute({ id: userUpdated.id })
    const updatedUser = await updateUser.execute({
      id: userUpdated.id,
      password: userUpdated.password,
    })

    expect(updatedUser).toMatchObject({
      id: createdUser.id,
      name: 'Peter',
      roleId: roles[1].id,
    })
  })

  it('Should be able to update a user with a teamId', async () => {
    const userUpdated = {
      id: createdUser.id,
      teamId: createdTeam.id,
    }

    await updateUser.execute(userUpdated)
    const updatedUser = await updateUser.execute(userUpdated)

    expect(updatedUser).toMatchObject({
      id: createdUser.id,
      teamId: createdTeam.id,
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

  it('Shouldn`t be able to update a user with a non-existing teamId', async () => {
    const user = {
      id: createdUser.id,
      teamId: crypto.randomUUID(),
    }

    await expect(updateUser.execute(user)).rejects.toHaveProperty(
      'message',
      'Team doesn`t exist.',
    )
  })
})

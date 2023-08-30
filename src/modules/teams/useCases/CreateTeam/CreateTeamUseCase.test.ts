import 'reflect-metadata'
import CreateTeamUseCase from './CreateTeamUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'

let createTeam: CreateTeamUseCase
let teamRepository: TeamRepository
let fakeCacheProvider: FakeCacheProvider

describe('Create Team', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest()
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to create a new team', async () => {
    const team = {
      name: 'Team 1',
    }

    const createdUser = await createTeam.execute(team)

    expect(createdUser).toMatchObject(team)
    expect(createdUser).toHaveProperty('id')
  })
})

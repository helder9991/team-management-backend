import 'reflect-metadata'
import ListTeamsUseCase from './ListTeamsUseCase'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import CreateTeamUseCase from '../CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'

let listTeams: ListTeamsUseCase
let createTeam: CreateTeamUseCase
let teamsRepository: TeamRepository
let fakeCacheProvider: FakeCacheProvider
let createdTeams: Team[] = []

describe('List Teams', () => {
  beforeAll(async () => {
    try {
      teamsRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()
      createTeam = new CreateTeamUseCase(teamsRepository, fakeCacheProvider)
      listTeams = new ListTeamsUseCase(teamsRepository, fakeCacheProvider)
      await clearTablesInTest({})
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ teams: true })
      createdTeams = []
      createdTeams.push(
        await createTeam.execute({
          name: 'Team 1',
        }),
      )
      createdTeams.push(
        await createTeam.execute({
          name: 'Team 2',
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all teams', async () => {
    const [teams] = await listTeams.execute({})

    expect(teams).toEqual(expect.arrayContaining(createdTeams))
  })

  it('Should be able to list all teams by page', async () => {
    const [teams] = await listTeams.execute({ page: 1 })

    expect(teams).toEqual(expect.arrayContaining(createdTeams))
  })

  it('Should be able to list all teams by cache', async () => {
    await listTeams.execute({})
    await clearTablesInTest({ teams: true })

    const [teams] = await listTeams.execute({})

    expect(teams).toEqual(expect.arrayContaining(createdTeams))
  })
})

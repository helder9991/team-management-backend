import 'reflect-metadata'
import DeleteTeamUseCase from './DeleteTeamUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from '../CreateTeam/CreateTeamUseCase'
import ListTeamsUseCase from '../ListTeams/ListTeamsUseCase'
import type Team from 'modules/teams/entities/Team'

let deleteTeam: DeleteTeamUseCase
let createTeam: CreateTeamUseCase
let listTeams: ListTeamsUseCase

let teamRepository: TeamRepository
let fakeCacheProvider: FakeCacheProvider

const createdTeams: Team[] = []

describe('Delete Team', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()

      deleteTeam = new DeleteTeamUseCase(teamRepository, fakeCacheProvider)
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)
      listTeams = new ListTeamsUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest()
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest()

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

  it('Should be able to delete a existing team', async () => {
    let [teams] = await listTeams.execute({})

    expect(teams).toHaveLength(2)

    await deleteTeam.execute({ id: createdTeams[0].id })
    ;[teams] = await listTeams.execute({})

    expect(teams).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing team', async () => {
    const nonExistingUser = {
      id: 'non-existing-id',
    }

    await expect(
      deleteTeam.execute({ id: nonExistingUser.id }),
    ).rejects.toHaveProperty('message', 'Team doesn`t exist.')
  })
})

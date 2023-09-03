import 'reflect-metadata'
import UpdateTeamUseCase from './UpdateTeamUseCase'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'

let updateTeam: UpdateTeamUseCase
let createTeam: CreateTeamUseCase

let teamRepository: TeamRepository
let fakeCacheProvider: FakeCacheProvider

let createdTeam: Team

describe('Update Team', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()

      updateTeam = new UpdateTeamUseCase(teamRepository, fakeCacheProvider)
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest({})

      createdTeam = await createTeam.execute({
        name: 'Team 1',
      })
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a team', async () => {
    const teamUpdated = {
      id: createdTeam.id,
      name: 'New team name',
    }

    const updatedUser = await updateTeam.execute(teamUpdated)

    expect(updatedUser).toMatchObject({
      id: teamUpdated.id,
      name: teamUpdated.name,
    })
  })

  it('Shouldn`t be able to update a non-existing team', async () => {
    const nonExistingTeam = {
      id: 'non-existing-id',
      name: 'Team',
    }

    await expect(updateTeam.execute(nonExistingTeam)).rejects.toHaveProperty(
      'message',
      'Team doesn`t exist.',
    )
  })
})

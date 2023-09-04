import 'reflect-metadata'
import CreateProjectUseCase from './CreateProjectUseCase'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Team from 'modules/teams/entities/Team'

let createTeam: CreateTeamUseCase
let createProject: CreateProjectUseCase

let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

let createdTeam: Team

describe('Create Project', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      projectRepository = new ProjectRepository()

      fakeCacheProvider = new FakeCacheProvider()
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)
      createProject = new CreateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )

      await clearTablesInTest({})

      const team = {
        name: 'Team 1',
      }

      createdTeam = await createTeam.execute(team)
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ projects: true })
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to create a new project', async () => {
    const project = {
      name: 'Project 1',
      teamId: createdTeam.id,
    }

    const createdUser = await createProject.execute(project)

    expect(createdUser).toMatchObject(project)
    expect(createdUser).toHaveProperty('id')
  })

  it('Shouldn`t be able to create a new project with the same name', async () => {
    const project = {
      name: 'Project 1',
      teamId: createdTeam.id,
    }

    await createProject.execute(project)

    await expect(createProject.execute(project)).rejects.toHaveProperty(
      'message',
      'Project already exists.',
    )
  })
})

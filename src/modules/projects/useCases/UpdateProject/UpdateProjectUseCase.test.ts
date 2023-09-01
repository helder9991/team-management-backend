import 'reflect-metadata'
import UpdateProjectUseCase from './UpdateProjectUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import CreateProjectUseCase from '../CreateProject/CreateProjectUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Project from 'modules/projects/entities/Project'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'

let updateProject: UpdateProjectUseCase
let createProject: CreateProjectUseCase
let createTeam: CreateTeamUseCase

let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

let createdProject: Project
let createdTeam: Team[] = []

describe('Update Project', () => {
  beforeAll(async () => {
    try {
      projectRepository = new ProjectRepository()
      teamRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()

      updateProject = new UpdateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createProject = new CreateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest({})

      // Create Teams
      createdTeam = []

      createdTeam.push(
        await createTeam.execute({
          name: 'Team 1',
        }),
      )

      createdTeam.push(
        await createTeam.execute({
          name: 'Team 2',
        }),
      )

      // Create Projects

      createdProject = await createProject.execute({
        name: 'Project 1',
        teamId: createdTeam[0].id,
      })
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a project', async () => {
    const projectUpdated: Project = {
      id: createdProject.id,
      name: 'New project name',
      teamId: createdTeam[1].id,
    }

    const updatedProject = await updateProject.execute(projectUpdated)

    expect(updatedProject).toMatchObject(projectUpdated)
  })

  it('Shouldn`t be able to update a non-existing project', async () => {
    const nonExistingProject = {
      id: 'non-existing-id',
      name: 'Project',
    }

    await expect(
      updateProject.execute(nonExistingProject),
    ).rejects.toHaveProperty('message', 'Project doesn`t exist.')
  })
})

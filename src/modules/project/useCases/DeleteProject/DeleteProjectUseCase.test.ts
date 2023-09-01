import 'reflect-metadata'
import DeleteProjectUseCase from './DeleteProjectUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import ProjectRepository from 'modules/project/repository/typeorm/ProjectRepository'
import CreateProjectUseCase from '../CreateProject/CreateProjectUseCase'
import ListProjectsUseCase from '../ListProjects/ListProjectsUseCase'

let deleteProject: DeleteProjectUseCase
let createTeam: CreateTeamUseCase
let createProject: CreateProjectUseCase
let listProjects: ListProjectsUseCase

let projectRepository: ProjectRepository
let teamRepository: TeamRepository
let fakeCacheProvider: FakeCacheProvider

const createdProjects: Team[] = []

describe('Delete Project', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      projectRepository = new ProjectRepository()
      fakeCacheProvider = new FakeCacheProvider()

      deleteProject = new DeleteProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)
      createProject = new CreateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      listProjects = new ListProjectsUseCase(
        projectRepository,
        fakeCacheProvider,
      )

      await clearTablesInTest({})
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ teams: true, projects: true })

      const createdTeam = await createTeam.execute({
        name: 'Team 1',
      })

      createdProjects.push(
        await createProject.execute({
          name: 'Project 1',
          teamId: createdTeam.id,
        }),
      )
      createdProjects.push(
        await createProject.execute({
          name: 'Project 2',
          teamId: createdTeam.id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing project', async () => {
    let [projects] = await listProjects.execute({})

    expect(projects).toHaveLength(2)

    await deleteProject.execute({ id: createdProjects[0].id })
    ;[projects] = await listProjects.execute({})

    expect(projects).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing project', async () => {
    const nonExistingUser = {
      id: 'non-existing-id',
    }

    await expect(
      deleteProject.execute({ id: nonExistingUser.id }),
    ).rejects.toHaveProperty('message', 'Project doesn`t exist.')
  })
})

import 'reflect-metadata'
import ListProjectsUseCase from './ListProjectsUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import CreateProjectUseCase from '../CreateProject/CreateProjectUseCase'
import ProjectRepository from 'modules/project/repository/typeorm/ProjectRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'
import type Project from 'modules/project/entities/Project'

let listProjects: ListProjectsUseCase
let createProject: CreateProjectUseCase
let createTeam: CreateTeamUseCase

let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

const createdProjects: Project[] = []
let createdTeam: Team

describe('List Projects', () => {
  beforeAll(async () => {
    try {
      projectRepository = new ProjectRepository()
      teamRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()

      listProjects = new ListProjectsUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createProject = new CreateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest()
    } catch (err) {
      console.error(err)
    }
  })

  beforeAll(async () => {
    try {
      await clearTablesInTest()

      createdTeam = await createTeam.execute({
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
      createdProjects.push(
        await createProject.execute({
          name: 'Project 3',
          teamId: createdTeam.id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all projects', async () => {
    const [projects] = await listProjects.execute({})

    expect(projects).toEqual(expect.arrayContaining(createdProjects))
  })

  it('Should be able to list all projects by cache', async () => {
    await listProjects.execute({})
    const [projects] = await listProjects.execute({})

    expect(projects).toEqual(expect.arrayContaining(createdProjects))
  })
})

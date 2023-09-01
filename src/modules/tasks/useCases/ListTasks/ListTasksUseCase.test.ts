import 'reflect-metadata'
import ListTasksUseCase from './ListTasksUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import CreateTaskUseCase from '../CreateTask/CreateTaskUseCase'
import type Task from 'modules/tasks/entities/Task'

let listTasks: ListTasksUseCase
let createProject: CreateProjectUseCase
let createTeam: CreateTeamUseCase
let createTask: CreateTaskUseCase

let taskRepository: TaskRepository
let taskStatusRepository: TaskStatusRepository
let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

const createdTasks: Task[] = []

describe('List Tasks', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      projectRepository = new ProjectRepository()
      taskRepository = new TaskRepository()
      taskStatusRepository = new TaskStatusRepository()

      fakeCacheProvider = new FakeCacheProvider()
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)
      createProject = new CreateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createTask = new CreateTaskUseCase(
        taskRepository,
        taskStatusRepository,
        projectRepository,
        fakeCacheProvider,
      )
      listTasks = new ListTasksUseCase(taskRepository, fakeCacheProvider)

      await clearTablesInTest({})

      // Create Team
      const team = {
        name: 'Team 1',
      }

      const createdTeam = await createTeam.execute(team)

      // Create Project
      const project = {
        name: 'Project 1',
        teamId: createdTeam.id,
      }

      const createdProject = await createProject.execute(project)

      // Create Task

      createdTasks.push(
        await createTask.execute({
          name: 'Task 1',
          description: 'Task 1 description',
          projectId: createdProject.id,
        }),
      )

      createdTasks.push(
        await createTask.execute({
          name: 'Task 2',
          projectId: createdProject.id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks', async () => {
    const [tasks] = await listTasks.execute({})

    expect(
      tasks.map(({ taskStatus, createdAt, deletedAt, ...rest }) => {
        return {
          ...rest,
        }
      }),
    ).toEqual(
      expect.arrayContaining(
        createdTasks.map(({ id, name, projectId, description, ...rest }) => {
          return {
            id,
            name,
            projectId,
            description: description ?? null,
          }
        }),
      ),
    )
  })

  it('Should be able to list all tasks by cache', async () => {
    await listTasks.execute({})
    const [tasks] = await listTasks.execute({})

    expect(
      tasks.map(({ taskStatus, createdAt, deletedAt, ...rest }) => {
        return {
          ...rest,
        }
      }),
    ).toEqual(
      expect.arrayContaining(
        createdTasks.map(({ id, name, projectId, description, ...rest }) => {
          return {
            id,
            name,
            projectId,
            description: description ?? null,
          }
        }),
      ),
    )
  })
})

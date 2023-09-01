import 'reflect-metadata'
import crypto from 'crypto'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import ProjectRepository from 'modules/project/repository/typeorm/ProjectRepository'
import CreateTaskUseCase from './CreateTaskUseCase'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import type Project from 'modules/project/entities/Project'
import CreateProjectUseCase from 'modules/project/useCases/CreateProject/CreateProjectUseCase'
import { readyTaskStatus } from 'modules/tasks/entities/TaskStatus'

let createTask: CreateTaskUseCase
let createTeam: CreateTeamUseCase
let createProject: CreateProjectUseCase

let taskRepository: TaskRepository
let taskStatusRepository: TaskStatusRepository
let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

let createdProject: Project

describe('Create Task', () => {
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

      createdProject = await createProject.execute(project)
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ tasks: true })
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to create a new task', async () => {
    const task = {
      name: 'Task 1',
      projectId: createdProject.id,
    }

    const createdTask = await createTask.execute(task)

    expect(createdTask).toMatchObject(task)
    expect(createdTask).toHaveProperty('id')
  })

  it('Shouldn`t be able to create a new task with a non-existing projectId', async () => {
    const task = {
      name: 'Task 1',
      description: 'Project 1 description',
      projectId: crypto.randomUUID(),
    }

    await expect(createTask.execute(task)).rejects.toHaveProperty(
      'message',
      'Project doesn`t exists.',
    )
  })

  it('Shouldn`t be able to create a new task if doesn`t find initialTaskStatus', async () => {
    const task = {
      name: 'Task 1',
      description: 'Project 1 description',
      projectId: createdProject.id,
    }
    const taskStatus = await taskStatusRepository.findByName(readyTaskStatus)

    expect(taskStatus).not.toBeNull()

    if (taskStatus === null) return

    taskStatusRepository.delete(taskStatus.id)

    await expect(createTask.execute(task)).rejects.toHaveProperty(
      'message',
      'Task Status doesn`t exists.',
    )
  })
})

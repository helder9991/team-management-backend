import 'reflect-metadata'
import crypto from 'crypto'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import CreateTaskUseCase from './CreateTaskUseCase'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import { readyTaskStatus } from 'modules/tasks/entities/TaskStatus'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Project from 'modules/projects/entities/Project'
import type Team from 'modules/teams/entities/Team'
import MainSeedController from 'shared/database/typeorm/seeds'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'

let createTask: CreateTaskUseCase
let createTeam: CreateTeamUseCase
let createProject: CreateProjectUseCase

let taskPriorityRepository: TaskPriorityRepository
let taskRepository: TaskRepository
let taskStatusRepository: TaskStatusRepository
let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

let createdProject: Project
const createdTeams: Team[] = []

describe('Create Task', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      projectRepository = new ProjectRepository()
      taskRepository = new TaskRepository()
      taskStatusRepository = new TaskStatusRepository()
      taskPriorityRepository = new TaskPriorityRepository()

      fakeCacheProvider = new FakeCacheProvider()
      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)
      createProject = new CreateProjectUseCase(
        projectRepository,
        fakeCacheProvider,
      )
      createTask = new CreateTaskUseCase(
        taskRepository,
        taskStatusRepository,
        taskPriorityRepository,
        projectRepository,
        fakeCacheProvider,
      )

      await clearTablesInTest({})

      // Create Team
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

      // Create Project
      const project = {
        name: 'Project 1',
        teamId: createdTeams[0].id,
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
      userTeamId: createdTeams[0].id,
    }

    const createdTask = await createTask.execute(task)

    expect(createdTask).toMatchObject({
      name: task.name,
      projectId: task.projectId,
    })
    expect(createdTask).toHaveProperty('id')
  })

  it('Shouldn`t be able to create a new task with a non-existing projectId', async () => {
    const task = {
      name: 'Task 1',
      description: 'Project 1 description',
      projectId: crypto.randomUUID(),
      userTeamId: createdTeams[0].id,
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
      userTeamId: createdTeams[0].id,
    }
    const taskStatus = await taskStatusRepository.findByName(readyTaskStatus)

    expect(taskStatus).not.toBeNull()

    if (taskStatus === null) return

    await clearTablesInTest({ tasks: true, tasksStatus: true })

    await expect(createTask.execute(task)).rejects.toHaveProperty(
      'message',
      'Task Status doesn`t exists.',
    )

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to create a new task if doesn`t find normalTaskPriority', async () => {
    const task = {
      name: 'Task 1',
      description: 'Project 1 description',
      projectId: createdProject.id,
      userTeamId: createdTeams[0].id,
    }
    const taskStatus = await taskStatusRepository.findByName(readyTaskStatus)

    expect(taskStatus).not.toBeNull()

    if (taskStatus === null) return

    await clearTablesInTest({ tasks: true, tasksPriority: true })

    await expect(createTask.execute(task)).rejects.toHaveProperty(
      'message',
      'Task Priority doesn`t exists.',
    )

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to create a task if the user doesn`t belongs to those team project', async () => {
    const task = {
      name: 'Task 1',
      description: 'Project 1 description',
      projectId: createdProject.id,
      userTeamId: createdTeams[1].id,
    }

    await expect(createTask.execute(task)).rejects.toHaveProperty(
      'message',
      'This user doesn`t belongs to this project.',
    )
  })
})

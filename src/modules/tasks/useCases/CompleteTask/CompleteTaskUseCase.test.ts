import 'reflect-metadata'
import crypto from 'crypto'
import MainSeedController from 'database/typeorm/seeds'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import CompleteTaskUseCase from './CompleteTaskUseCase'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import type TaskStatus from 'modules/tasks/entities/TaskStatus'
import { completedTaskStatus } from 'modules/tasks/entities/TaskStatus'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Project from 'modules/projects/entities/Project'
import CreateTaskUseCase from '../CreateTask/CreateTaskUseCase'
import type Task from 'modules/tasks/entities/Task'
import type Team from 'modules/teams/entities/Team'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'

let createTask: CreateTaskUseCase
let completeTask: CompleteTaskUseCase
let createTeam: CreateTeamUseCase
let createProject: CreateProjectUseCase

let taskRepository: TaskRepository
let taskPriorityRepository: TaskPriorityRepository
let taskStatusRepository: TaskStatusRepository
let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

let createdTeam: Team
let createdTask: Task
let createdProject: Project
let completeTaskStatusRow: TaskStatus | null

describe('Complete Task', () => {
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
      completeTask = new CompleteTaskUseCase(
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

      createdTeam = await createTeam.execute(team)

      // Create Project
      const project = {
        name: 'Project 1',
        teamId: createdTeam.id,
      }

      createdProject = await createProject.execute(project)

      // Get Completed Status row in database

      completeTaskStatusRow =
        await taskStatusRepository.findByName(completedTaskStatus)

      if (completeTaskStatusRow === null)
        console.error(new Error('Task Status doesn`t found.'))
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ tasks: true })

      // Create Task
      const task = {
        name: 'Task 1',
        projectId: createdProject.id,
        userTeamId: createdTeam.id,
      }

      createdTask = await createTask.execute(task)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to complete a task', async () => {
    const completedTask = await completeTask.execute({
      id: createdTask.id,
      userTeamId: createdProject.teamId,
    })

    expect(completedTask.taskStatusId).toBe(completeTaskStatusRow?.id)
  })

  it('Shouldn`t be able to complete task if it was already completed before', async () => {
    await completeTask.execute({
      id: createdTask.id,
      userTeamId: createdProject.teamId,
    })

    await expect(
      completeTask.execute({
        id: createdTask.id,
        userTeamId: createdProject.teamId,
      }),
    ).rejects.toHaveProperty('message', 'This tasks was already completed.')
  })

  it('Shouldn`t be able to complete task if TaskStatus doesn`t exists', async () => {
    await clearTablesInTest({ tasks: true, tasksStatus: true })

    await expect(
      completeTask.execute({
        id: createdTask.id,
        userTeamId: createdProject.teamId,
      }),
    ).rejects.toHaveProperty('message', 'Task Status doesn`t exists.')

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to complete task if task doesn`t exists', async () => {
    await clearTablesInTest({ tasks: true })

    await expect(
      completeTask.execute({
        id: createdTask.id,
        userTeamId: createdProject.teamId,
      }),
    ).rejects.toHaveProperty('message', 'Task doesn`t exists.')

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to complete task if user doesn`t belongs a team project', async () => {
    await expect(
      completeTask.execute({
        id: createdTask.id,
        userTeamId: crypto.randomUUID(),
      }),
    ).rejects.toHaveProperty(
      'message',
      'This user doesn`t belongs to this project.',
    )
  })
})

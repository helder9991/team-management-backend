import 'reflect-metadata'
import crypto from 'crypto'
import MainSeedController from 'shared/database/typeorm/seeds'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import InProgressTaskUseCase from './InProgressTaskUseCase'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import type TaskStatus from 'modules/tasks/entities/TaskStatus'
import { inProgressTaskStatus } from 'modules/tasks/entities/TaskStatus'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Project from 'modules/projects/entities/Project'
import CreateTaskUseCase from '../CreateTask/CreateTaskUseCase'
import type Task from 'modules/tasks/entities/Task'
import type Team from 'modules/teams/entities/Team'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'

let createTask: CreateTaskUseCase
let inProgressTask: InProgressTaskUseCase
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
let inProgressTaskStatusRow: TaskStatus | null

describe('In Progress Task', () => {
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
      inProgressTask = new InProgressTaskUseCase(
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

      // Get inProgress Status row in database

      inProgressTaskStatusRow =
        await taskStatusRepository.findByName(inProgressTaskStatus)

      if (inProgressTaskStatusRow === null)
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

  it('Should be able to mark a task to in progress', async () => {
    const inProgressedTask = await inProgressTask.execute({
      id: createdTask.id,
      userTeamId: createdProject.teamId,
    })

    expect(inProgressedTask.taskStatusId).toBe(inProgressTaskStatusRow?.id)
  })

  it('Shouldn`t be able to mark a task to in progress if it was already in progress before', async () => {
    await inProgressTask.execute({
      id: createdTask.id,
      userTeamId: createdProject.teamId,
    })

    await expect(
      inProgressTask.execute({
        id: createdTask.id,
        userTeamId: createdProject.teamId,
      }),
    ).rejects.toHaveProperty('message', 'This tasks was already in progress.')
  })

  it('Shouldn`t be able to mark a task to in progress if TaskStatus doesn`t exists', async () => {
    await clearTablesInTest({ tasks: true, tasksStatus: true })

    await expect(
      inProgressTask.execute({
        id: createdTask.id,
        userTeamId: createdProject.teamId,
      }),
    ).rejects.toHaveProperty('message', 'Task Status doesn`t exists.')

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to mark a task to in progress if task doesn`t exists', async () => {
    await clearTablesInTest({ tasks: true })

    await expect(
      inProgressTask.execute({
        id: createdTask.id,
        userTeamId: createdProject.teamId,
      }),
    ).rejects.toHaveProperty('message', 'Task doesn`t exists.')

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to mark a task to in progress if user doesn`t belongs a team project', async () => {
    await expect(
      inProgressTask.execute({
        id: createdTask.id,
        userTeamId: crypto.randomUUID(),
      }),
    ).rejects.toHaveProperty(
      'message',
      'This user doesn`t belongs to this project.',
    )
  })
})

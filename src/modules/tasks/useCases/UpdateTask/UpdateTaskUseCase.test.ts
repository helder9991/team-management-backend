import 'reflect-metadata'
import crypto from 'crypto'
import MainSeedController from 'shared/database/typeorm/seeds'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Project from 'modules/projects/entities/Project'
import CreateTaskUseCase from '../CreateTask/CreateTaskUseCase'
import type Task from 'modules/tasks/entities/Task'
import type Team from 'modules/teams/entities/Team'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'
import UpdateTaskUseCase from './UpdateTaskUseCase'
import type TaskPriority from 'modules/tasks/entities/TaskPriority'
import { lowTaskPriority } from 'modules/tasks/entities/TaskPriority'

let createTask: CreateTaskUseCase
let updateTask: UpdateTaskUseCase
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
let lowTaskPriorityRow: TaskPriority | null

describe('Update Task', () => {
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
      updateTask = new UpdateTaskUseCase(
        taskRepository,
        taskPriorityRepository,
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

      // Get Low Task Priority row in database

      lowTaskPriorityRow =
        await taskPriorityRepository.findByName(lowTaskPriority)
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

  it('Should be able to update a task', async () => {
    const task = {
      id: createdTask.id,
      name: 'New task name',
      description: 'New task description',
    }

    let updatedTask = await updateTask.execute({
      ...task,
      userTeamId: createdProject.teamId,
    })

    expect(updatedTask).toMatchObject(task)

    updatedTask = await updateTask.execute({
      ...task,
      taskPriorityId: lowTaskPriorityRow?.id,
      userTeamId: createdProject.teamId,
    })

    expect(updatedTask).toMatchObject({
      ...task,
      taskPriorityId: lowTaskPriorityRow?.id,
    })
  })

  it('Shouldn`t be able to update task if Task Priority doesn`t exists', async () => {
    await clearTablesInTest({ tasks: true })

    const task = {
      id: createdTask.id,
      name: 'New task name',
      description: 'New task description',
      userTeamId: createdProject.teamId,
      taskPriorityId: crypto.randomUUID(),
    }

    await expect(updateTask.execute(task)).rejects.toHaveProperty(
      'message',
      'Task Priority doesn`t exists.',
    )

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to update task if task doesn`t exists', async () => {
    await clearTablesInTest({ tasks: true })

    const task = {
      id: crypto.randomUUID(),
      name: 'New task name',
      description: 'New task description',
      userTeamId: createdProject.teamId,
    }

    await expect(updateTask.execute(task)).rejects.toHaveProperty(
      'message',
      'Task doesn`t exists.',
    )

    await MainSeedController.run({ silent: true })
  })

  it('Shouldn`t be able to complete task if user doesn`t belongs a team project', async () => {
    const task = {
      id: createdTask.id,
      name: 'New task name',
      description: 'New task description',
      userTeamId: crypto.randomUUID(),
    }

    await expect(updateTask.execute(task)).rejects.toHaveProperty(
      'message',
      'This user doesn`t belongs to this project.',
    )
  })
})

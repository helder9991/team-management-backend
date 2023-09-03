import 'reflect-metadata'
import crypto from 'crypto'
import ListTasksUseCase from './ListTasksUseCase'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'
import CreateTaskUseCase from '../CreateTask/CreateTaskUseCase'
import type Task from 'modules/tasks/entities/Task'
import type Project from 'modules/projects/entities/Project'
import type Team from 'modules/teams/entities/Team'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'

let listTasks: ListTasksUseCase
let createProject: CreateProjectUseCase
let createTeam: CreateTeamUseCase
let createTask: CreateTaskUseCase

let taskRepository: TaskRepository
let taskStatusRepository: TaskStatusRepository
let taskPriorityRepository: TaskPriorityRepository
let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

const createdTasks: Task[] = []
const createdProjects: Project[] = []
const createdTeams: Team[] = []

describe('List Tasks', () => {
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
      listTasks = new ListTasksUseCase(
        taskRepository,
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
      createdProjects.push(
        await createProject.execute({
          name: 'Project 1',
          teamId: createdTeams[0].id,
        }),
      )
      createdProjects.push(
        await createProject.execute({
          name: 'Project 2',
          teamId: createdTeams[0].id,
        }),
      )

      // Create Task
      createdTasks.push(
        await createTask.execute({
          name: 'Task 1',
          description: 'Task 1 description',
          projectId: createdProjects[0].id,
          userTeamId: createdTeams[0].id,
        }),
      )

      createdTasks.push(
        await createTask.execute({
          name: 'Task 2',
          projectId: createdProjects[0].id,
          userTeamId: createdTeams[0].id,
        }),
      )

      createdTasks.push(
        await createTask.execute({
          name: 'Task 3',
          projectId: createdProjects[1].id,
          userTeamId: createdTeams[0].id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks by projectId', async () => {
    const [tasks] = await listTasks.execute({
      projectId: createdProjects[0].id,
      userTeamId: createdProjects[0].teamId,
    })

    expect(tasks).toHaveLength(2)
    expect(
      tasks.map(({ taskPriority, taskStatus, userId = null, ...rest }) => {
        return {
          ...rest,
          userId,
          taskStatusId: taskStatus.id,
          taskPriorityId: taskPriority.id,
        }
      }),
    ).toEqual(
      expect.arrayContaining(
        createdTasks
          .filter((task) => task.projectId === createdProjects[0].id)
          .map(
            ({
              taskPriority,
              taskStatus,
              userId = null,
              description = null,
              ...rest
            }) => {
              return {
                ...rest,
                userId,
                description,
              }
            },
          ),
      ),
    )
  })

  it('Should be able to list all tasks in cache by productId', async () => {
    await listTasks.execute({
      projectId: createdProjects[0].id,
      userTeamId: createdProjects[0].teamId,
    })
    const [tasks] = await listTasks.execute({
      projectId: createdProjects[0].id,
      userTeamId: createdProjects[0].teamId,
    })

    expect(
      tasks.map(({ taskPriority, taskStatus, userId = null, ...rest }) => {
        return {
          ...rest,
          userId,
          taskStatusId: taskStatus.id,
          taskPriorityId: taskPriority.id,
        }
      }),
    ).toEqual(
      expect.arrayContaining(
        createdTasks
          .filter((task) => task.projectId === createdProjects[0].id)
          .map(
            ({
              taskPriority,
              taskStatus,
              userId = null,
              description = null,
              ...rest
            }) => {
              return {
                ...rest,
                userId,
                description,
              }
            },
          ),
      ),
    )
  })

  it('Shouldn`t be able to list all tasks by productId if the user doesn`t belongs to those team project', async () => {
    await expect(
      listTasks.execute({
        projectId: createdProjects[0].id,
        userTeamId: createdTeams[1].id,
      }),
    ).rejects.toHaveProperty(
      'message',
      'This user doesn`t belongs to this project.',
    )
  })

  it('Shouldn`t be able to list all tasks by productId if the project doesn`t exist', async () => {
    await expect(
      listTasks.execute({
        projectId: crypto.randomUUID(),
        userTeamId: createdTeams[1].id,
      }),
    ).rejects.toHaveProperty('message', 'Project doesn`t exist.')
  })
})

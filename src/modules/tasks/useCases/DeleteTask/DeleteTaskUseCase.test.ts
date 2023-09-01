import 'reflect-metadata'
import DeleteTaskUseCase from './DeleteTaskUseCase'
import clearTablesInTest from 'utils/clearTablesInTest'
import FakeCacheProvider from 'container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import type Team from 'modules/teams/entities/Team'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type Project from 'modules/projects/entities/Project'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import CreateTaskUseCase from '../CreateTask/CreateTaskUseCase'
import ListTasksUseCase from '../ListTasks/ListTasksUseCase'
import type Task from 'modules/tasks/entities/Task'
import CreateProjectUseCase from 'modules/projects/useCases/CreateProject/CreateProjectUseCase'

let createProject: CreateProjectUseCase
let createTeam: CreateTeamUseCase
let createTask: CreateTaskUseCase
let deleteTask: DeleteTaskUseCase
let listTasks: ListTasksUseCase

let taskRepository: TaskRepository
let taskStatusRepository: TaskStatusRepository
let teamRepository: TeamRepository
let projectRepository: ProjectRepository
let fakeCacheProvider: FakeCacheProvider

let createdTask: Task
const createdProjects: Project[] = []
const createdTeams: Team[] = []

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

      listTasks = new ListTasksUseCase(
        taskRepository,
        projectRepository,
        fakeCacheProvider,
      )
      deleteTask = new DeleteTaskUseCase(
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
          teamId: createdTeams[1].id,
        }),
      )
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ tasks: true })

      // Create Task
      createdTask = await createTask.execute({
        name: 'Task 1',
        description: 'Task 1 description',
        projectId: createdProjects[0].id,
        userTeamId: createdTeams[0].id,
      })

      await createTask.execute({
        name: 'Task 2',
        description: 'Task 2 description',
        projectId: createdProjects[0].id,
        userTeamId: createdTeams[0].id,
      })
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing task', async () => {
    let [tasks] = await listTasks.execute({
      projectId: createdProjects[0].id,
      userTeamId: createdProjects[0].teamId,
    })

    expect(tasks).toHaveLength(2)

    await deleteTask.execute({
      id: createdTask.id,
      userTeamId: createdProjects[0].teamId,
    })
    ;[tasks] = await listTasks.execute({
      projectId: createdProjects[0].id,
      userTeamId: createdProjects[0].teamId,
    })

    expect(tasks).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing task', async () => {
    const nonExistingTask = {
      id: 'non-existing-id',
    }

    await expect(
      deleteTask.execute({
        id: nonExistingTask.id,
        userTeamId: createdProjects[0].teamId,
      }),
    ).rejects.toHaveProperty('message', 'Task doesn`t exist.')
  })

  it('Shouldn`t be able to delete a task if the user doesn`t belongs to those team project', async () => {
    await expect(
      deleteTask.execute({
        id: createdTask.id,
        userTeamId: createdProjects[1].teamId,
      }),
    ).rejects.toHaveProperty(
      'message',
      'This user doesn`t belongs to this project.',
    )
  })
})

import { container } from 'tsyringe'
import './providers'
import type IAuthenticateRepository from 'modules/users/repository/interfaces/IAuthenticateRepository'
import type IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import type IUserRoleRepository from 'modules/users/repository/interfaces/IUserRoleRepository'
import AuthenticateRepository from 'modules/users/repository/jwt/AuthenticateRepository'
import UserRepository from 'modules/users/repository/typeorm/UserRepository'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import ProjectRepository from 'modules/projects/repository/typeorm/ProjectRepository'
import type IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import type ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import TaskRepository from 'modules/tasks/repository/typeorm/TaskRepository'
import type ITaskStatusRepository from 'modules/tasks/repository/interfaces/ITaskStatusRepository'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import type ITaskPriorityRepository from 'modules/tasks/repository/interfaces/ITaskPriorityRepository'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'

container.registerSingleton<IUserRepository>('UserRepository', UserRepository)
container.registerSingleton<IUserRoleRepository>(
  'UserRoleRepository',
  UserRoleRepository,
)
container.registerSingleton<IAuthenticateRepository>(
  'AuthenticateRepository',
  AuthenticateRepository,
)
container.registerSingleton<ITeamRepository>('TeamRepository', TeamRepository)
container.registerSingleton<IProjectRepository>(
  'ProjectRepository',
  ProjectRepository,
)
container.registerSingleton<ITaskRepository>('TaskRepository', TaskRepository)
container.registerSingleton<ITaskStatusRepository>(
  'TaskStatusRepository',
  TaskStatusRepository,
)
container.registerSingleton<ITaskPriorityRepository>(
  'TaskPriorityRepository',
  TaskPriorityRepository,
)

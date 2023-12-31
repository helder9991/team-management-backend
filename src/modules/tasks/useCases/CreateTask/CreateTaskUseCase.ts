import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import type Task from 'modules/tasks/entities/Task'
import { normalTaskPriority } from 'modules/tasks/entities/TaskPriority'
import { readyTaskStatus } from 'modules/tasks/entities/TaskStatus'
import ITaskPriorityRepository from 'modules/tasks/repository/interfaces/ITaskPriorityRepository'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import ITaskStatusRepository from 'modules/tasks/repository/interfaces/ITaskStatusRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'shared/utils/AppError'

type ICreateTaskParams = Pick<Task, 'name' | 'projectId'> & {
  description?: string
  userTeamId: string
  userId?: string
}

@injectable()
class CreateTaskUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('TaskStatusRepository')
    private readonly taskStatusRepository: ITaskStatusRepository,

    @inject('TaskPriorityRepository')
    private readonly taskPriorityRepository: ITaskPriorityRepository,

    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    name,
    description,
    projectId,
    userTeamId,
    userId,
  }: ICreateTaskParams): Promise<Task> {
    const projectExists = await this.projectRepository.findById(projectId)

    if (projectExists === null)
      throw new AppError('Project doesn`t exists.', 400)

    const taskStatusExists =
      await this.taskStatusRepository.findByName(readyTaskStatus)

    if (taskStatusExists === null)
      throw new AppError('Task Status doesn`t exists.', 400)

    if (projectExists?.teamId !== userTeamId)
      throw new AppError('This user doesn`t belongs to this project.')

    const taskPriorityExists =
      await this.taskPriorityRepository.findByName(normalTaskPriority)

    if (taskPriorityExists === null)
      throw new AppError('Task Priority doesn`t exists.', 400)

    const task = await this.taskRepository.create({
      name,
      description,
      projectId,
      taskStatusId: taskStatusExists.id,
      taskPriorityId: taskPriorityExists.id,
      userId,
    })

    await this.cacheProvider.invalidatePrefix('tasks-list')

    return task
  }
}

export default CreateTaskUseCase

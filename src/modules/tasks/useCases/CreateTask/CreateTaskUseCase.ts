import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import IProjectRepository from 'modules/project/repository/interfaces/IProjectRepository'
import type Task from 'modules/tasks/entities/Task'
import { readyTaskStatus } from 'modules/tasks/entities/TaskStatus'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import ITaskStatusRepository from 'modules/tasks/repository/interfaces/ITaskStatusRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type ICreateTaskParams = Pick<Task, 'name' | 'projectId'> & {
  description?: string
}

@injectable()
class CreateTaskUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('TaskStatusRepository')
    private readonly taskStatusRepository: ITaskStatusRepository,

    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    name,
    description,
    projectId,
  }: ICreateTaskParams): Promise<Task> {
    const projectExists = await this.projectRepository.findById(projectId)

    if (projectExists === null)
      throw new AppError('Project doesn`t exists.', 400)

    const taskStatusExists =
      await this.taskStatusRepository.findByName(readyTaskStatus)

    if (taskStatusExists === null)
      throw new AppError('Task Status doesn`t exists.', 400)

    const task = await this.taskRepository.create({
      name,
      description,
      projectId,
      taskStatusId: taskStatusExists?.id,
    })

    await this.cacheProvider.invalidatePrefix('tasks-list')

    return task
  }
}

export default CreateTaskUseCase

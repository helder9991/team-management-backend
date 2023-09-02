import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import type Task from 'modules/tasks/entities/Task'
import { readyTaskStatus } from 'modules/tasks/entities/TaskStatus'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import ITaskStatusRepository from 'modules/tasks/repository/interfaces/ITaskStatusRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IReadyTaskParams = Pick<Task, 'id'> & {
  userTeamId: string
}

@injectable()
class ReadyTaskUseCase {
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

  async execute({ id, userTeamId }: IReadyTaskParams): Promise<Task> {
    const taskStatusExists =
      await this.taskStatusRepository.findByName(readyTaskStatus)

    if (taskStatusExists === null)
      throw new AppError('Task Status doesn`t exists.', 400)

    const taskExists = await this.taskRepository.findById(id)

    if (taskExists === null) throw new AppError('Task doesn`t exists.', 400)

    const projectExists = await this.projectRepository.findById(
      taskExists.projectId,
    )

    if (projectExists?.teamId !== userTeamId)
      throw new AppError('This user doesn`t belongs to this project.')

    if (taskExists.taskStatusId === taskStatusExists.id)
      throw new AppError('This task is already ready.')

    const task = await this.taskRepository.update({
      ...taskExists,
      taskStatusId: taskStatusExists.id,
    })

    await this.cacheProvider.invalidatePrefix('tasks-list')

    return task
  }
}

export default ReadyTaskUseCase

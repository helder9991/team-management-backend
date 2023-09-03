import ICacheProvider from 'shared/container/providers/CacheProvider/models/ICacheProvider'
import IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import type Task from 'modules/tasks/entities/Task'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'shared/utils/AppError'

type IDeleteTaskParams = Pick<Task, 'id'> & {
  userTeamId: string
}

@injectable()
class DeleteTaskUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({ id, userTeamId }: IDeleteTaskParams): Promise<void> {
    const taskExists = await this.taskRepository.findById(id)

    if (taskExists === null) throw new AppError('Task doesn`t exist.', 400)

    const projectExists = await this.projectRepository.findById(
      taskExists.projectId,
    )

    if (projectExists?.teamId !== userTeamId)
      throw new AppError('This user doesn`t belongs to this project.')

    await this.taskRepository.delete(id)

    await this.cacheProvider.invalidatePrefix('tasks-list')
  }
}

export default DeleteTaskUseCase

import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import type Task from 'modules/tasks/entities/Task'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import removeUndefinedProperties from 'shared/utils/removeUndefinedProperties'
import ITaskPriorityRepository from 'modules/tasks/repository/interfaces/ITaskPriorityRepository'

type IUpdateTaskParams = Partial<
  Pick<Task, 'name' | 'description' | 'taskPriorityId'>
> & {
  id: string
  userTeamId: string
}

@injectable()
class UpdateTaskUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('TaskPriorityRepository')
    private readonly taskPriorityRepository: ITaskPriorityRepository,

    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    id,
    name,
    description,
    taskPriorityId,
    userTeamId,
  }: IUpdateTaskParams): Promise<Task> {
    if (taskPriorityId !== undefined) {
      const taskPriorityExists =
        await this.taskPriorityRepository.findById(taskPriorityId)

      if (taskPriorityExists === null)
        throw new AppError('Task Priority doesn`t exists.', 400)
    }

    const taskExists = await this.taskRepository.findById(id)

    if (taskExists === null) throw new AppError('Task doesn`t exists.', 400)

    const projectExists = await this.projectRepository.findById(
      taskExists.projectId,
    )

    if (projectExists?.teamId !== userTeamId)
      throw new AppError('This user doesn`t belongs to this project.')

    const task = await this.taskRepository.update({
      ...taskExists,
      ...removeUndefinedProperties({
        name,
        description,
        taskPriorityId,
      }),
    })

    await this.cacheProvider.invalidatePrefix('users-list')

    return task
  }
}

export default UpdateTaskUseCase

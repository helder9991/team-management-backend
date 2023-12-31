import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import { type ISavedItemCount } from 'shared/interfaces/database'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import type Task from 'modules/tasks/entities/Task'
import IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import AppError from 'shared/utils/AppError'

interface IListTasksParams {
  page?: number
  projectId: string
  userId?: string
  taskStatusId?: string
  taskPriorityId?: string
}

@injectable()
class ListTasksUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    page,
    projectId,
    userId,
    taskStatusId,
    taskPriorityId,
  }: IListTasksParams): Promise<[Task[], ISavedItemCount]> {
    const projectExists = await this.projectRepository.findById(projectId)

    if (projectExists === null) throw new AppError('Project doesn`t exist.')

    const whereConditions = {
      projectId,
      userId,
      taskStatusId,
      taskPriorityId,
    }

    const tasksListCached = await this.cacheProvider.recover<
      [Task[], ISavedItemCount]
    >(`tasks-list:${page ?? 'all'}:params=${JSON.stringify(whereConditions)}`)

    let tasks, savedItemCount

    if (tasksListCached !== null) {
      ;[tasks, savedItemCount] = tasksListCached
    } else {
      ;[tasks, savedItemCount] = await this.taskRepository.list({
        page,
        where: {
          projectId,
          userId,
          taskStatusId,
          taskPriorityId,
        },
      })

      await this.cacheProvider.save(
        `tasks-list:${page ?? 'all'}:params=${JSON.stringify(whereConditions)}`,
        [tasks, savedItemCount],
      )
    }
    return [tasks, savedItemCount]
  }
}

export default ListTasksUseCase

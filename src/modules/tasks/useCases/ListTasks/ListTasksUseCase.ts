import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import { type ISavedItemCount } from 'shared/interfaces/database'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import type Task from 'modules/tasks/entities/Task'

interface IListTasksParams {
  page?: number
}

@injectable()
class ListTasksUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    page = 1,
  }: IListTasksParams): Promise<[Task[], ISavedItemCount]> {
    const tasksListCached = await this.cacheProvider.recover<
      [Task[], ISavedItemCount]
    >(`tasks-list:${page}`)

    let tasks, savedItemCount

    if (tasksListCached !== null) {
      ;[tasks, savedItemCount] = tasksListCached
    } else {
      ;[tasks, savedItemCount] = await this.taskRepository.list({
        page,
      })

      await this.cacheProvider.save(`tasks-list:${page}`, [
        tasks,
        savedItemCount,
      ])
    }
    return [tasks, savedItemCount]
  }
}

export default ListTasksUseCase

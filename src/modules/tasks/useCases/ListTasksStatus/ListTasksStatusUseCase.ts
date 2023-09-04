import { inject, injectable } from 'tsyringe'
import ITaskStatusRepository from 'modules/tasks/repository/interfaces/ITaskStatusRepository'
import type TaskStatus from 'modules/tasks/entities/TaskStatus'
import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'

@injectable()
class ListTasksStatusUseCase {
  constructor(
    @inject('TaskStatusRepository')
    private readonly taskStatusRepository: ITaskStatusRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(): Promise<TaskStatus[]> {
    const tasksListCached =
      await this.cacheProvider.recover<TaskStatus[]>(`tasks-status-list}`)

    let tasksStatus

    if (tasksListCached !== null) {
      tasksStatus = tasksListCached
    } else {
      tasksStatus = await this.taskStatusRepository.list()

      await this.cacheProvider.save(`tasks-status-list`, tasksStatus)
    }

    return tasksStatus
  }
}

export default ListTasksStatusUseCase

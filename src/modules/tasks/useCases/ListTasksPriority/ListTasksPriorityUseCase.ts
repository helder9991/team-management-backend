import { inject, injectable } from 'tsyringe'
import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import ITaskPriorityRepository from 'modules/tasks/repository/interfaces/ITaskPriorityRepository'
import type TaskPriority from 'modules/tasks/entities/TaskPriority'

@injectable()
class ListTasksPriorityUseCase {
  constructor(
    @inject('TaskPriorityRepository')
    private readonly taskPriorityRepository: ITaskPriorityRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(): Promise<TaskPriority[]> {
    const tasksPrioriryListCached =
      await this.cacheProvider.recover<TaskPriority[]>(`tasks-priority-list`)

    let tasksPriority

    if (tasksPrioriryListCached !== null) {
      tasksPriority = tasksPrioriryListCached
    } else {
      tasksPriority = await this.taskPriorityRepository.list()

      await this.cacheProvider.save(`tasks-priority-list`, tasksPriority)
    }

    return tasksPriority
  }
}

export default ListTasksPriorityUseCase

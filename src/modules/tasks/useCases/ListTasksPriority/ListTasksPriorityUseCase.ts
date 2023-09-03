import { inject, injectable } from 'tsyringe'
import type TaskStatus from 'modules/tasks/entities/TaskStatus'
import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import ITaskPriorityRepository from 'modules/tasks/repository/interfaces/ITaskPriorityRepository'

@injectable()
class ListTasksPriorityUseCase {
  constructor(
    @inject('TaskPriorityRepository')
    private readonly taskPriorityRepository: ITaskPriorityRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(): Promise<TaskStatus[]> {
    const tasksPrioriryListCached =
      await this.cacheProvider.recover<TaskStatus[]>(`tasks-priority-list}`)

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

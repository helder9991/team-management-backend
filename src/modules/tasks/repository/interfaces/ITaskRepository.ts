import type ICreateTaskDTO from 'modules/tasks/dtos/ICreateTaskDTO'
import type IListTasksDTO from 'modules/tasks/dtos/IListTasksDTO'
import type Task from 'modules/tasks/entities/Task'
import { type ISavedItemCount } from 'shared/interfaces/database'

interface ITaskRepository {
  create: (data: ICreateTaskDTO) => Promise<Task>
  list: (data: IListTasksDTO) => Promise<[Task[], ISavedItemCount]>
}

export default ITaskRepository

import type ICreateTaskDTO from 'modules/tasks/dtos/ICreateTaskDTO'
import type IListTasksDTO from 'modules/tasks/dtos/IListTasksDTO'
import type IUpdateTaskDTO from 'modules/tasks/dtos/IUpdateTaskDTO'
import type Task from 'modules/tasks/entities/Task'
import { type ISavedItemCount } from 'shared/interfaces/database'

interface ITaskRepository {
  create: (data: ICreateTaskDTO) => Promise<Task>
  list: (data: IListTasksDTO) => Promise<[Task[], ISavedItemCount]>
  findById: (id: string) => Promise<Task | null>
  update: (data: IUpdateTaskDTO) => Promise<Task>
  delete: (id: string) => Promise<boolean>
}

export default ITaskRepository

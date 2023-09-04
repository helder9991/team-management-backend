import type TaskStatus from 'modules/tasks/entities/TaskStatus'
import { type ITaskStatusName } from 'modules/tasks/entities/TaskStatus'

interface ITaskStatusRepository {
  list: () => Promise<TaskStatus[]>
  findByName: (name: ITaskStatusName) => Promise<TaskStatus | null>
}

export default ITaskStatusRepository

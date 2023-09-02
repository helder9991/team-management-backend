import { type ITaskPriorityName } from 'modules/tasks/entities/TaskPriority'
import type TaskPriority from 'modules/tasks/entities/TaskPriority'

interface ITaskPriorityRepository {
  list: () => Promise<TaskPriority[]>
  findByName: (name: ITaskPriorityName) => Promise<TaskPriority | null>
}

export default ITaskPriorityRepository

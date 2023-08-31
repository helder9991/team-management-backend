import type ICreateTaskDTO from 'modules/tasks/dtos/ICreateTaskDTO'
import type Task from 'modules/tasks/entities/Task'

interface ITaskRepository {
  create: (data: ICreateTaskDTO) => Promise<Task>
}

export default ITaskRepository

import typeORMConnection from 'database/typeorm'
import type ITaskPriorityRepository from '../interfaces/ITaskPriority'
import { type Repository } from 'typeorm'
import TaskPriority, {
  type ITaskPriorityName,
} from 'modules/tasks/entities/TaskPriority'

class TaskPriorityRepository implements ITaskPriorityRepository {
  private readonly repository: Repository<TaskPriority>

  constructor() {
    this.repository = typeORMConnection.getRepository(TaskPriority)
  }

  async list(): Promise<TaskPriority[]> {
    const tasksPriority = await this.repository.find()

    return tasksPriority
  }

  async findByName(name: ITaskPriorityName): Promise<TaskPriority | null> {
    const taskPriority = await this.repository.findOneBy({ name })

    return taskPriority
  }
}

export default TaskPriorityRepository

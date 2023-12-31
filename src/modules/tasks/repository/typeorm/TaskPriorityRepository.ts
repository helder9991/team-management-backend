import typeORMConnection from 'shared/database/typeorm'
import type ITaskPriorityRepository from '../interfaces/ITaskPriorityRepository'
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

  async findById(id: string): Promise<TaskPriority | null> {
    const taskPriority = await this.repository.findOneBy({ id })

    return taskPriority
  }
}

export default TaskPriorityRepository

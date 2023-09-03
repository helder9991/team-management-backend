import TaskStatus, {
  type ITaskStatusName,
} from 'modules/tasks/entities/TaskStatus'
import { type Repository } from 'typeorm'
import type ITaskStatusRepository from '../interfaces/ITaskStatusRepository'
import typeORMConnection from 'shared/database/typeorm'

class TaskStatusRepository implements ITaskStatusRepository {
  private readonly repository: Repository<TaskStatus>

  constructor() {
    this.repository = typeORMConnection.getRepository(TaskStatus)
  }

  async list(): Promise<TaskStatus[]> {
    const taskStatus = await this.repository.find()

    return taskStatus
  }

  async findByName(name: ITaskStatusName): Promise<TaskStatus | null> {
    const taskStatus = await this.repository.findOneBy({ name })

    return taskStatus
  }
}

export default TaskStatusRepository

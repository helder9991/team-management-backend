import TaskStatus, {
  type ITaskStatusName,
} from 'modules/tasks/entities/TaskStatus'
import { type Repository } from 'typeorm'
import type ITaskStatusRepository from '../interfaces/ITaskStatusRepository'
import typeORMConnection from 'database/typeorm'

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

  async delete(id: string): Promise<boolean> {
    const wasDeleted = await this.repository.softDelete(id)

    return wasDeleted.affected !== undefined && wasDeleted.affected > 0
  }
}

export default TaskStatusRepository

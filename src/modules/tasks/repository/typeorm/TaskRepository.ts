import crypto from 'crypto'
import type ITaskRepository from '../interfaces/ITaskRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'database/typeorm'
import Task from 'modules/tasks/entities/Task'
import type ICreateTaskDTO from 'modules/tasks/dtos/ICreateTaskDTO'

class TaskRepository implements ITaskRepository {
  private readonly repository: Repository<Task>

  constructor() {
    this.repository = typeORMConnection.getRepository(Task)
  }

  async create({
    name,
    description,
    projectId,
    taskStatusId,
  }: ICreateTaskDTO): Promise<Task> {
    const task = this.repository.create({
      id: crypto.randomUUID(),
      name,
      description,
      projectId,
      taskStatusId,
      createdAt: new Date(),
    })

    await this.repository.save(task)

    return task
  }
}

export default TaskRepository

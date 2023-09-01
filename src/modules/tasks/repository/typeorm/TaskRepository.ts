import crypto from 'crypto'
import type ITaskRepository from '../interfaces/ITaskRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'database/typeorm'
import Task from 'modules/tasks/entities/Task'
import type ICreateTaskDTO from 'modules/tasks/dtos/ICreateTaskDTO'
import { type ISavedItemCount } from 'shared/interfaces/database'
import type IUpdateTaskDTO from 'modules/tasks/dtos/IUpdateTaskDTO'
import type IListTasksDTO from 'modules/tasks/dtos/IListTasksDTO'

const itensPerPage = 30
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

  async list({
    page,
    where = {},
  }: IListTasksDTO): Promise<[Task[], ISavedItemCount]> {
    const tasks = await this.repository.findAndCount({
      where,
      relations: ['taskStatus'],
      select: [
        'id',
        'name',
        'description',
        'projectId',
        'createdAt',
        'deletedAt',
      ],
      skip: (page - 1) * itensPerPage,
      take: itensPerPage,
    })

    return tasks
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.repository.findOne({
      where: { id },
      relations: ['taskStatus'],
    })

    return task
  }

  async update({
    id,
    name,
    description,
    taskStatusId,
  }: IUpdateTaskDTO): Promise<Task> {
    const task = await this.repository.save({
      id,
      name,
      description,
      taskStatusId,
    })

    return task
  }
}

export default TaskRepository

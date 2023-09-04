import crypto from 'crypto'
import type IProjectRepository from '../interfaces/IProjectRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'shared/database/typeorm'
import Project from 'modules/projects/entities/Project'
import type ICreateProjectDTO from 'modules/projects/dtos/ICreateProjectDTO'
import type IListProjectsDTO from 'modules/projects/dtos/IListProjectDTO'
import { type ISavedItemCount } from 'shared/interfaces/database'
import type IUpdateProjectDTO from 'modules/projects/dtos/IUpdateProjectDTO'

const itensPerPage = 30

class ProjectRepository implements IProjectRepository {
  private readonly repository: Repository<Project>

  constructor() {
    this.repository = typeORMConnection.getRepository(Project)
  }

  async create({ name, teamId }: ICreateProjectDTO): Promise<Project> {
    const project = this.repository.create({
      id: crypto.randomUUID(),
      name,
      teamId,
      createdAt: new Date(),
    })

    await this.repository.save(project)

    return project
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.repository.findOneBy({ id })

    return project
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.repository.findOneBy({ name })

    return project
  }

  async list({
    page,
  }: IListProjectsDTO): Promise<[Project[], ISavedItemCount]> {
    let pagination = {}

    if (page !== undefined) {
      pagination = {
        skip: (page - 1) * itensPerPage,
        take: itensPerPage,
      }
    }

    const project = await this.repository.findAndCount({
      ...pagination,
    })

    return project
  }

  async update({ id, name, teamId }: IUpdateProjectDTO): Promise<Project> {
    const project = await this.repository.save({
      id,
      name,
      teamId,
    })

    return project
  }

  async delete(id: string): Promise<boolean> {
    const wasDeleted = await this.repository.softDelete(id)

    return wasDeleted.affected !== undefined && wasDeleted.affected > 0
  }
}

export default ProjectRepository

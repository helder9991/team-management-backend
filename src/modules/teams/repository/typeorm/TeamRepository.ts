import crypto from 'crypto'
import type ITeamRepository from '../interfaces/ITeamRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'shared/database/typeorm'
import Team from 'modules/teams/entities/Team'
import type ICreateTeamDTO from 'modules/teams/dtos/ICreateTeamDTO'
import type IListTeamsDTO from 'modules/teams/dtos/IListTeamsDTO'
import { type ISavedItemCount } from 'shared/interfaces/database'
import type IUpdateTeamDTO from 'modules/teams/dtos/IUpdateTeamDTO'

const itensPerPage = 30

class TeamRepository implements ITeamRepository {
  private readonly repository: Repository<Team>

  constructor() {
    this.repository = typeORMConnection.getRepository(Team)
  }

  async create({ name }: ICreateTeamDTO): Promise<Team> {
    const team = this.repository.create({
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    })

    await this.repository.save(team)

    return team
  }

  async list({ page }: IListTeamsDTO): Promise<[Team[], ISavedItemCount]> {
    const teams = await this.repository.findAndCount({
      skip: (page - 1) * itensPerPage,
      take: itensPerPage,
    })

    return teams
  }

  async findById(id: string): Promise<Team | null> {
    const team = await this.repository.findOneBy({ id })

    return team
  }

  async update({ id, name }: IUpdateTeamDTO): Promise<Team> {
    const team = await this.repository.save({
      id,
      name,
    })

    return team
  }

  async delete(id: string): Promise<boolean> {
    const wasDeleted = await this.repository.softDelete(id)

    return wasDeleted.affected !== undefined && wasDeleted.affected > 0
  }
}

export default TeamRepository

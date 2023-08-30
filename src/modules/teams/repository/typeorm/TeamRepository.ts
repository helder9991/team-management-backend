import crypto from 'crypto'
import type ITeamRepository from '../interfaces/ITeamRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'database/typeorm'
import Team from 'modules/teams/entities/Team'
import type ICreateTeamDTO from 'modules/teams/dtos/ICreateTeamDTO'

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
}

export default TeamRepository

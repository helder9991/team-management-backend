import ICacheProvider from 'shared/container/providers/CacheProvider/models/ICacheProvider'
import type Team from 'modules/teams/entities/Team'
import ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'shared/utils/AppError'

type IUpdateTeamParams = Pick<Team, 'id' | 'name'>

@injectable()
class UpdateTeamUseCase {
  constructor(
    @inject('TeamRepository')
    private readonly teamRepository: ITeamRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({ id, name }: IUpdateTeamParams): Promise<Team> {
    const teamExists = await this.teamRepository.findById(id)

    if (teamExists === null) throw new AppError('Team doesn`t exist.', 400)

    const team = await this.teamRepository.update({
      id,
      name,
    })

    await this.cacheProvider.invalidatePrefix('teams-list')

    return team
  }
}

export default UpdateTeamUseCase

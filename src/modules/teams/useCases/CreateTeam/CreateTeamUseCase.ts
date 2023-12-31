import ICacheProviders from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import type Team from 'modules/teams/entities/Team'

type ICreateTeamParams = Pick<Team, 'name'>

@injectable()
class CreateTeamUseCase {
  constructor(
    @inject('TeamRepository')
    private readonly teamRepository: ITeamRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProviders,
  ) {}

  async execute({ name }: ICreateTeamParams): Promise<Team> {
    const team = await this.teamRepository.create({
      name,
    })

    await this.cacheProvider.invalidatePrefix('teams-list')

    return team
  }
}

export default CreateTeamUseCase

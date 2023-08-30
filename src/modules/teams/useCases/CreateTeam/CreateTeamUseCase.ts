import ICacheProviders from 'container/providers/CacheProvider/models/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import type Team from 'modules/teams/entities/Team'

type ICreateUserParams = Pick<Team, 'name'>

@injectable()
class CreateTeamUseCase {
  constructor(
    @inject('TeamRepository')
    private readonly teamRepository: ITeamRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProviders,
  ) {}

  async execute({ name }: ICreateUserParams): Promise<Team> {
    const team = await this.teamRepository.create({
      name,
    })

    await this.cacheProvider.invalidatePrefix('teams-list')

    return team
  }
}

export default CreateTeamUseCase

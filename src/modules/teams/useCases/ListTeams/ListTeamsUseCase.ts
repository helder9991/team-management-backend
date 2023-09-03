import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import { type ISavedItemCount } from 'shared/interfaces/database'
import type Team from 'modules/teams/entities/Team'

interface IListTeamsParams {
  page?: number
}

@injectable()
class ListTeamsUseCase {
  constructor(
    @inject('TeamRepository')
    private readonly teamRepository: ITeamRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    page = 1,
  }: IListTeamsParams): Promise<[Team[], ISavedItemCount]> {
    const teamsListCached = await this.cacheProvider.recover<
      [Team[], ISavedItemCount]
    >(`teams-list:${page}`)

    let teams, savedItemCount

    if (teamsListCached !== null) {
      ;[teams, savedItemCount] = teamsListCached
    } else {
      ;[teams, savedItemCount] = await this.teamRepository.list({
        page,
      })

      await this.cacheProvider.save(`teams-list:${page}`, [
        teams,
        savedItemCount,
      ])
    }
    return [teams, savedItemCount]
  }
}

export default ListTeamsUseCase

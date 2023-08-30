import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import type Team from 'modules/teams/entities/Team'
import ITeamRepository from 'modules/teams/repository/interfaces/ITeamRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IDeleteUserParams = Pick<Team, 'id'>

@injectable()
class DeleteTeamUseCase {
  constructor(
    @inject('TeamRepository')
    private readonly teamRepository: ITeamRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({ id }: IDeleteUserParams): Promise<void> {
    const teamDeleted = await this.teamRepository.delete(id)

    if (!teamDeleted) throw new AppError('Team doesn`t exist.')

    await this.cacheProvider.invalidatePrefix('teams-list')
  }
}

export default DeleteTeamUseCase

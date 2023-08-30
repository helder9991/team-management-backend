import type User from 'modules/users/entities/User'
import IUserRepository, {
  type SavedItemCount,
} from 'modules/users/repository/interfaces/IUserRepository'
import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import { inject, injectable } from 'tsyringe'

interface IListUsersParams {
  page?: number
}

@injectable()
class ListUsersUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    page = 1,
  }: IListUsersParams): Promise<[User[], SavedItemCount]> {
    const usersListCached = await this.cacheProvider.recover<
      [User[], SavedItemCount]
    >(`users-list:${page}`)

    let users, savedItemCount

    if (usersListCached !== null) {
      ;[users, savedItemCount] = usersListCached
    } else {
      ;[users, savedItemCount] = await this.userRepository.list({
        page,
      })

      await this.cacheProvider.save(`users-list:${page}`, [
        users,
        savedItemCount,
      ])
    }
    return [users, savedItemCount]
  }
}

export default ListUsersUseCase

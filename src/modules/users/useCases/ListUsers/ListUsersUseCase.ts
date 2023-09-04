import type User from 'modules/users/entities/User'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import { type ISavedItemCount } from 'shared/interfaces/database'

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
    page,
  }: IListUsersParams): Promise<[User[], ISavedItemCount]> {
    const usersListCached = await this.cacheProvider.recover<
      [User[], ISavedItemCount]
    >(`users-list:${page ?? 'all'}`)

    let users, savedItemCount

    if (usersListCached !== null) {
      ;[users, savedItemCount] = usersListCached
    } else {
      ;[users, savedItemCount] = await this.userRepository.list({
        page,
      })

      await this.cacheProvider.save(`users-list:${page ?? 'all'}`, [
        users,
        savedItemCount,
      ])
    }
    return [users, savedItemCount]
  }
}

export default ListUsersUseCase

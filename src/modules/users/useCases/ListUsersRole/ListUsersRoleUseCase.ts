import { inject, injectable } from 'tsyringe'
import type TaskStatus from 'modules/tasks/entities/TaskStatus'
import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import IUserRoleRepository from 'modules/users/repository/interfaces/IUserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'

@injectable()
class ListUsersRoleUseCase {
  constructor(
    @inject('UserRoleRepository')
    private readonly usersRoleRepository: IUserRoleRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(): Promise<UserRole[]> {
    const tasksPrioriryListCached =
      await this.cacheProvider.recover<TaskStatus[]>(`users-role-list`)

    let usersRole

    if (tasksPrioriryListCached !== null) {
      usersRole = tasksPrioriryListCached
    } else {
      usersRole = await this.usersRoleRepository.list()

      await this.cacheProvider.save(`users-role-list`, usersRole)
    }

    return usersRole
  }
}

export default ListUsersRoleUseCase

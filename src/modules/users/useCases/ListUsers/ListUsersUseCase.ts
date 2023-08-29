import type User from 'modules/users/entities/User'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import { inject, injectable } from 'tsyringe'

@injectable()
class ListUsersUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    const users = await this.userRepository.list()

    return users
  }
}

export default ListUsersUseCase

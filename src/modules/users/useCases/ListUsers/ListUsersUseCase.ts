import type User from 'modules/users/entities/User'
import IUserRepository, {
  type SavedItemCount,
} from 'modules/users/repository/interfaces/IUserRepository'
import { inject, injectable } from 'tsyringe'

interface IListUsersParams {
  page?: number
}

@injectable()
class ListUsersUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({
    page = 1,
  }: IListUsersParams): Promise<[User[], SavedItemCount]> {
    const [users, savedItemCount] = await this.userRepository.list({
      page,
    })

    return [users, savedItemCount]
  }
}

export default ListUsersUseCase

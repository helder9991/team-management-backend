import type User from 'modules/users/entities/User'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IDeleteUserParams = Pick<User, 'id'>

@injectable()
class DeleteUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ id }: IDeleteUserParams): Promise<void> {
    const userDeleted = await this.userRepository.delete(id)

    if (!userDeleted) throw new AppError('User doesn`t exist.')
  }
}

export default DeleteUserUseCase

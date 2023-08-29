import type ICreateUserDTO from 'modules/users/dtos/ICreateUserDTO'
import type User from 'modules/users/entities/User'

interface IUserRepository {
  create: (data: ICreateUserDTO) => Promise<User>
  findByEmail: (email: string) => Promise<User | null>
}

export default IUserRepository

import type ICreateUserDTO from 'modules/users/dtos/ICreateUserDTO'
import type IUpdateUserDTO from 'modules/users/dtos/IUpdateUserDTO'
import type User from 'modules/users/entities/User'

interface IUserRepository {
  create: (data: ICreateUserDTO) => Promise<User>
  update: (data: IUpdateUserDTO) => Promise<User>
  findByEmail: (email: string) => Promise<User | null>
  findById: (id: string) => Promise<User | null>
  list: () => Promise<User[]>
}

export default IUserRepository

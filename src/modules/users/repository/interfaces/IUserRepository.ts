import type ICreateUserDTO from 'modules/users/dtos/ICreateUserDTO'
import type IListUsersDTO from 'modules/users/dtos/IListUsersDTO'
import type IUpdateUserDTO from 'modules/users/dtos/IUpdateUserDTO'
import type User from 'modules/users/entities/User'
import { type ISavedItemCount } from 'shared/interfaces/database'

interface IUserRepository {
  create: (data: ICreateUserDTO) => Promise<User>
  update: (data: IUpdateUserDTO) => Promise<User>
  findByEmail: (email: string) => Promise<User | null>
  findById: (id: string) => Promise<User | null>
  list: (data: IListUsersDTO) => Promise<[User[], ISavedItemCount]>
  delete: (id: string) => Promise<boolean>
}

export default IUserRepository

import { type FindOptionsWhere } from 'typeorm'
import type User from '../entities/User'

interface IListUsersDTO {
  page?: number
  where?: FindOptionsWhere<User>
}

export default IListUsersDTO

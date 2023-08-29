import type IUserRoleRepository from '../interfaces/IUserRoleRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'database/typeorm'
import UserRole from 'modules/users/entities/UserRole'

class UserRoleRepository implements IUserRoleRepository {
  private readonly repository: Repository<UserRole>

  constructor() {
    this.repository = typeORMConnection.getRepository(UserRole)
  }

  async list(): Promise<UserRole[]> {
    const userRoles = await this.repository.find()

    return userRoles
  }

  async findById(id: string): Promise<UserRole | null> {
    const user = await this.repository.findOneBy({ id })

    return user
  }
}

export default UserRoleRepository

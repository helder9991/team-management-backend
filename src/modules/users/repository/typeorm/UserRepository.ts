import crypto from 'crypto'
import { hash } from 'bcryptjs'
import type ICreateUserDTO from 'modules/users/dtos/ICreateUserDTO'
import User from 'modules/users/entities/User'
import type IUserRepository from '../interfaces/IUserRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'database/typeorm'

class UserRepository implements IUserRepository {
  private readonly repository: Repository<User>

  constructor() {
    this.repository = typeORMConnection.getRepository(User)
  }

  async create({
    name,
    email,
    password,
    roleId,
    teamId,
  }: ICreateUserDTO): Promise<User> {
    const user = this.repository.create({
      id: crypto.randomUUID(),
      name,
      email,
      password: await hash(password, 8),
      roleId,
      teamId,
      createdAt: new Date(),
    })

    await this.repository.save(user)

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOneBy({ email })

    return user
  }
}

export default UserRepository

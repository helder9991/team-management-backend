import crypto from 'crypto'
import { hash } from 'bcryptjs'
import type ICreateUserDTO from 'modules/users/dtos/ICreateUserDTO'
import User from 'modules/users/entities/User'
import type IUserRepository from '../interfaces/IUserRepository'
import { type Repository } from 'typeorm'
import typeORMConnection from 'database/typeorm'
import type IUpdateUserDTO from 'modules/users/dtos/IUpdateUserDTO'
import type IListUsersDTO from 'modules/users/dtos/IListUsersDTO'
import { type SavedItemCount } from '../interfaces/IUserRepository'

const itensPerPage = 30
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

  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findOneBy({ id })

    return user
  }

  async update({
    id,
    name,
    password,
    isNewPassword,
    roleId,
    teamId,
  }: IUpdateUserDTO): Promise<User> {
    const hashedPassword =
      isNewPassword === true ? await hash(password, 8) : password

    const user = await this.repository.save({
      id,
      name,
      password: hashedPassword,
      roleId,
      teamId,
    })

    return user
  }

  async list({ page }: IListUsersDTO): Promise<[User[], SavedItemCount]> {
    const users = await this.repository.findAndCount({
      select: [
        'id',
        'name',
        'email',
        'teamId',
        'roleId',
        'createdAt',
        'deletedAt',
      ],
      skip: (page - 1) * itensPerPage,
      take: itensPerPage,
    })

    return users
  }

  async delete(id: string): Promise<boolean> {
    const wasDeleted = await this.repository.softDelete(id)

    return wasDeleted.affected !== undefined && wasDeleted.affected > 0
  }
}

export default UserRepository

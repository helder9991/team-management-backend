import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import { type ICreateUserControllerResponse } from './CreateUserController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []

describe('Create User E2E', () => {
  beforeAll(async () => {
    try {
      userRoleRepository = new UserRoleRepository()

      await clearTablesInTest()
      roles = await userRoleRepository.list()
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to create a new user', async () => {
    const user = {
      name: 'John',
      email: 'john@mail.com',
      password: '123456789',
      roleId: roles[0].id,
    }
    const response = await request(app).post('/user').send(user)

    const body: ICreateUserControllerResponse =
      response.body as ICreateUserControllerResponse

    expect(response.status).toBe(201)

    expect(body).toMatchObject({
      name: user.name,
      email: user.email,
      roleId: roles[0].id,
    })
  })

  it('Should`t be able to create a new user if you pass a wrong parameters', async () => {
    const user = {
      name: 'John',
      email: 'johnmail.com',
      password: '123456',
      roleId: crypto.randomUUID(),
    }
    const response = await request(app).post('/user').send(user)

    const body: ICreateUserControllerResponse =
      response.body as ICreateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
    expect(body).not.toHaveProperty('password')
  })
})

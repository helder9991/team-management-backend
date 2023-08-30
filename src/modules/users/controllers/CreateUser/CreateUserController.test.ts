import 'express-async-errors'
import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import { type ICreateUserControllerResponse } from './CreateUserController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from '../AuthenticateUser/AuthenticateUserController'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
let adminToken = ''

describe('Create User E2E', () => {
  beforeAll(async () => {
    try {
      userRoleRepository = new UserRoleRepository()

      await clearTablesInTest()
      roles = await userRoleRepository.list()

      const response = await request(app).post('/auth').send({
        email: 'admin@team.com.br',
        password: 'admin123',
      })

      const body: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      adminToken = body.token
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
    const response = await request(app)
      .post('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(user)

    const body: ICreateUserControllerResponse =
      response.body as ICreateUserControllerResponse

    expect(response.status).toBe(201)

    expect(body).toMatchObject({
      name: user.name,
      email: user.email,
      roleId: roles[0].id,
    })
  })

  it('Shouldn`t be able to create a new user with a non-admin account', async () => {
    for (const role of roles) {
      if (role.name === 'Administrador') continue

      await clearTablesInTest()
      const user = {
        name: 'non-admin',
        email: 'non-admin@mail.com',
        password: '123456789',
        roleId: role.id,
      }

      let response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)

      response = await request(app).post('/auth').send(user)

      const authBody: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${authBody.token}`)
        .send(user)

      const body: ICreateUserControllerResponse =
        response.body as ICreateUserControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Should`t be able to create a new user if you pass a wrong parameters', async () => {
    const user = {
      name: 'John',
      email: 'johnmail.com',
      password: '123456',
      roleId: crypto.randomUUID(),
    }
    const response = await request(app)
      .post('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(user)

    const body: ICreateUserControllerResponse =
      response.body as ICreateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
    expect(body).not.toHaveProperty('password')
  })
})

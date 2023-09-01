import request from 'supertest'
import app from '../../../../app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from './AuthenticateUserController'
import type User from 'modules/users/entities/User'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
let user: Omit<User, 'id'>
let adminToken = ''

describe('Authenticate User E2E', () => {
  beforeAll(async () => {
    try {
      userRoleRepository = new UserRoleRepository()

      await clearTablesInTest({})
      roles = await userRoleRepository.list()

      const response = await request(app).post('/auth').send({
        email: 'admin@team.com.br',
        password: 'admin123',
      })

      const body: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      adminToken = body.token

      // Create User
      user = {
        name: 'John',
        email: 'john@mail.com',
        password: '123456789',
        roleId: roles[0].id,
      }

      await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to authenticate', async () => {
    const response = await request(app).post('/auth').send({
      email: 'john@mail.com',
      password: '123456789',
    })

    const body: IAuthenticateUserControllerResponse =
      response.body as IAuthenticateUserControllerResponse

    expect(response.status).toBe(201)

    expect(body).toHaveProperty('token')
  })

  it('Shouldn`t be able to authenticate with a non-existing user', async () => {
    const response = await request(app).post('/auth').send({
      email: 'non-existing-user@mail.com',
      password: '123456789',
    })

    const body: IAuthenticateUserControllerResponse =
      response.body as IAuthenticateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'User doesn`t exist.' })
  })

  it('Shouldn`t be able to authenticate if you pass a wrong password', async () => {
    const response = await request(app).post('/auth').send({
      email: 'john@mail.com',
      password: 'wrong-password',
    })

    const body: IAuthenticateUserControllerResponse =
      response.body as IAuthenticateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Login or password is invalid.' })
  })

  it('Shouldn`t be able to authenticate if you pass a wrong parameters', async () => {
    const response = await request(app).post('/auth').send({
      email: 1,
      password: '123',
    })

    const body: IAuthenticateUserControllerResponse =
      response.body as IAuthenticateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

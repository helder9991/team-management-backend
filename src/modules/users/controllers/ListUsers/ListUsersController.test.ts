import request from 'supertest'
import app from 'shared/app'
import { type IListUsersControllerResponse } from './ListUsersController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import type User from 'modules/users/entities/User'
import { type IAuthenticateUserControllerResponse } from '../AuthenticateUser/AuthenticateUserController'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
const createdUsers: User[] = []
let adminToken = ''

describe('List Users E2E', () => {
  beforeAll(async () => {
    try {
      userRoleRepository = new UserRoleRepository()

      await clearTablesInTest({})
      roles = await userRoleRepository.list()

      let response = await request(app).post('/auth').send({
        email: 'admin@team.com.br',
        password: 'admin123',
      })

      const body: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      adminToken = body.token

      // Create Users
      response = await request(app)
        .post('/user')
        .send({
          name: 'John',
          email: 'john@mail.com',
          password: '123456789',
          roleId: roles[0].id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdUsers.push(response.body)

      response = await request(app)
        .post('/user')
        .send({
          name: 'Peter',
          email: 'peter@mail.com',
          password: '456123789',
          roleId: roles[1].id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdUsers.push(response.body)

      response = await request(app)
        .post('/user')
        .send({
          name: 'Mary',
          email: 'mary@mail.com',
          password: '789654321',
          roleId: roles[2].id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdUsers.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all users', async () => {
    const response = await request(app)
      .get(`/user`)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IListUsersControllerResponse =
      response.body as IListUsersControllerResponse

    expect(response.status).toBe(200)

    expect(body.users).toHaveLength(4)
    expect(
      body.users.map(({ createdAt, deletedAt, ...rest }) => {
        return {
          ...rest,
        }
      }),
    ).toEqual(expect.arrayContaining(createdUsers))
  })

  it('Should`t be able to list users if you pass a wrong parameters', async () => {
    const response = await request(app)
      .get(`/user`)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        page: -1,
      })

    const body: IListUsersControllerResponse =
      response.body as IListUsersControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

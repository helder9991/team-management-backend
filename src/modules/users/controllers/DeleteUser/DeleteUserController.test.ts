import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import type User from 'modules/users/entities/User'
import { type IAuthenticateUserControllerResponse } from '../AuthenticateUser/AuthenticateUserController'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
const createdUsers: User[] = []
let adminToken = ''

describe('Delete User E2E', () => {
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
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ users: true })
      let response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John',
          email: 'john@mail.com',
          password: '123456789',
          roleId: roles[0].id,
        })

      createdUsers.push(response.body)

      response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Peter',
          email: 'peter@mail.com',
          password: '123456789',
          roleId: roles[0].id,
        })

      createdUsers.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing user', async () => {
    let response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.users).toHaveLength(3)

    response = await request(app)
      .delete(`/user/${createdUsers[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(204)

    response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.users).toHaveLength(2)
  })

  it('Shouldn`t be able to delete a non-existing user', async () => {
    const response = await request(app)
      .delete(`/user/${crypto.randomUUID()}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'User doesn`t exist.' })
  })

  it('Shouldn`t be able to delete a user with a non-admin account', async () => {
    for (const role of roles) {
      if (role.name === adminUserRoleName) continue

      const user = {
        name: 'non-admin',
        email: `non-admin-${crypto.randomUUID()}@mail.com`,
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
        .delete(`/user/${createdUsers[0].id}`)
        .set('Authorization', `Bearer ${authBody.token}`)

      expect(response.status).toBe(401)

      expect(response.body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Shouldn`t be able to delete if you pass a wrong parameters', async () => {
    const nonExistingId = 'non-existing-id'
    const response = await request(app)
      .delete(`/user/${nonExistingId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

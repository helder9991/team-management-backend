import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import { type IUpdateUserControllerResponse } from './UpdateUserController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import type User from 'modules/users/entities/User'
import { type IAuthenticateUserControllerResponse } from '../AuthenticateUser/AuthenticateUserController'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
let createdUser: User
let adminToken = ''

describe('Update User E2E', () => {
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

  beforeEach(async () => {
    try {
      await clearTablesInTest()
      const user = {
        name: 'John',
        email: 'john@mail.com',
        password: '123456789',
        roleId: roles[0].id,
      }
      const response = await request(app)
        .post('/user')
        .send(user)
        .set('Authorization', `Bearer ${adminToken}`)

      createdUser = response.body
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a user', async () => {
    const response = await request(app)
      .put(`/user/${createdUser.id}`)
      .send({
        name: 'Peter',
        password: '987654321',
        roleId: roles[1].id,
      })
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateUserControllerResponse =
      response.body as IUpdateUserControllerResponse

    expect(response.status).toBe(200)

    expect(body).toMatchObject({
      name: 'Peter',
      roleId: roles[1].id,
    })
  })

  it('Shouldn`t be able to update a non-existing user', async () => {
    const response = await request(app)
      .put(`/user/${crypto.randomUUID()}`)
      .send({
        name: 'Peter',
        roleId: roles[1].id,
      })
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateUserControllerResponse =
      response.body as IUpdateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'User doesn`t exist.' })
  })

  it('Shouldn`t be able to update a user with a non-admin account', async () => {
    for (const role of roles) {
      if (role.name === 'Administrador') return

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
        .put(`/user/${createdUser.id}`)
        .set('Authorization', `Bearer ${authBody.token}`)
        .send({
          name: 'Peter',
          roleId: roles[1].id,
        })

      expect(response.status).toBe(401)

      expect(response.body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Shouldn`t be able to update if you pass a wrong parameters', async () => {
    const response = await request(app)
      .put(`/user/${crypto.randomUUID()}`)
      .send({
        name: 1,
        roleId: 1,
        teamId: 1,
      })
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateUserControllerResponse =
      response.body as IUpdateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

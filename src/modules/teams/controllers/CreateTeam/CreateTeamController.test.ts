import 'express-async-errors'
import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type ICreateTeamControllerResponse } from './CreateTeamController'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type UserRole from 'modules/users/entities/UserRole'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
let adminToken = ''

describe('Create Team E2E', () => {
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

  it('Should be able to create a new team', async () => {
    const team = {
      name: 'Team 1',
    }
    const response = await request(app)
      .post('/team')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(team)

    const body: ICreateTeamControllerResponse =
      response.body as ICreateTeamControllerResponse

    expect(response.status).toBe(201)

    expect(body).toMatchObject(team)
    expect(body).toHaveProperty('id')
  })

  it('Shouldn`t be able to create a new team with a non-admin account', async () => {
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
        .post('/team')
        .set('Authorization', `Bearer ${authBody.token}`)
        .send({
          name: 'Team 1',
        })

      const body: ICreateTeamControllerResponse =
        response.body as ICreateTeamControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Should`t be able to create a new team if you pass a wrong parameters', async () => {
    const team = {
      name: 1,
    }

    const response = await request(app)
      .post('/team')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(team)

    const body: ICreateTeamControllerResponse =
      response.body as ICreateTeamControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

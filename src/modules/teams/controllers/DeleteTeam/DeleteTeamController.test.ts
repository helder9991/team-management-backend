import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import type User from 'modules/users/entities/User'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
const createdTeams: User[] = []

let adminToken = ''

describe('Delete Team E2E', () => {
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
      let response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Team 1',
        })

      createdTeams.push(response.body)

      response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Team 2',
        })

      createdTeams.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing team', async () => {
    let response = await request(app)
      .get('/team')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.teams).toHaveLength(2)

    response = await request(app)
      .delete(`/team/${createdTeams[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(204)

    response = await request(app)
      .get('/team')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.teams).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing team', async () => {
    const response = await request(app)
      .delete(`/team/${crypto.randomUUID()}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Team doesn`t exist.' })
  })

  it('Shouldn`t be able to delete a team with a non-admin account', async () => {
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
        .delete(`/team/${createdTeams[0].id}`)
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
      .delete(`/team/${nonExistingId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

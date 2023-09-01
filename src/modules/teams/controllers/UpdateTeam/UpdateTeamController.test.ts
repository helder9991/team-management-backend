import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import clearTablesInTest from 'utils/clearTablesInTest'
import type Team from 'modules/teams/entities/Team'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import { type IUpdateTeamControllerResponse } from './UpdateTeamController'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type UserRole from 'modules/users/entities/UserRole'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
let createdTeam: Team
let adminToken = ''

describe('Update Team E2E', () => {
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

      // Create Team
      const team = {
        name: 'Team 1',
      }
      response = await request(app)
        .post('/team')
        .send(team)
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeam = response.body
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a team', async () => {
    const response = await request(app)
      .put(`/team/${createdTeam.id}`)
      .send({
        name: 'New team name',
      })
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateTeamControllerResponse =
      response.body as IUpdateTeamControllerResponse

    expect(response.status).toBe(200)

    expect(body).toMatchObject({
      name: 'New team name',
    })
  })

  it('Shouldn`t be able to update a non-existing team', async () => {
    const response = await request(app)
      .put(`/team/${crypto.randomUUID()}`)
      .send({
        name: 'Team 1',
      })
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateTeamControllerResponse =
      response.body as IUpdateTeamControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Team doesn`t exist.' })
  })

  it('Shouldn`t be able to update a team with a non-admin account', async () => {
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
        .put(`/team/${createdTeam.id}`)
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
      .put(`/team/1`)
      .send({
        name: -1,
      })
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateTeamControllerResponse =
      response.body as IUpdateTeamControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

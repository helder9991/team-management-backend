import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import { type IListTeamsControllerResponse } from './ListTeamsController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import type Team from 'modules/teams/entities/Team'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
const createdTeams: Team[] = []
let adminToken = ''

describe('List Teams E2E', () => {
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

      // Create Teams
      response = await request(app)
        .post('/team')
        .send({
          name: 'Team 1',
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeams.push(response.body)

      response = await request(app)
        .post('/team')
        .send({
          name: 'Team 2',
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeams.push(response.body)

      response = await request(app)
        .post('/team')
        .send({
          name: 'Team 3',
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeams.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all teams', async () => {
    const response = await request(app)
      .get(`/team`)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IListTeamsControllerResponse =
      response.body as IListTeamsControllerResponse

    expect(response.status).toBe(200)

    expect(body.teams).toHaveLength(3)
    expect(
      body.teams.map(({ createdAt, deletedAt, ...rest }) => {
        return {
          ...rest,
        }
      }),
    ).toEqual(expect.arrayContaining(createdTeams))
  })

  it('Shouldn`t be able to list all teams with a non-admin account', async () => {
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
        .get('/team')
        .set('Authorization', `Bearer ${authBody.token}`)
        .send({
          name: 'Team 1',
        })

      const body: IListTeamsControllerResponse =
        response.body as IListTeamsControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Shouldn`t be able to list all teams if you pass a wrong parameters', async () => {
    const response = await request(app)
      .get('/team')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        page: -1,
      })

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

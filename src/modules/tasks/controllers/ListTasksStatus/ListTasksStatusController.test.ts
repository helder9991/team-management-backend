import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type IListTasksStatusControllerResponse } from './ListTasksStatusController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'
import { insertTasksStatusName } from 'shared/database/typeorm/seeds/TasksStatusSeed'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []

let teamMemberToken = ''
let adminToken = ''

describe('List Tasks Status E2E', () => {
  beforeAll(async () => {
    try {
      userRoleRepository = new UserRoleRepository()

      await clearTablesInTest({})
      roles = await userRoleRepository.list()

      // generate admin token
      let response = await request(app).post('/auth').send({
        email: 'admin@team.com.br',
        password: 'admin123',
      })

      const body: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      adminToken = body.token

      // Create team-member user
      const teamMemberRole = await userRoleRepository.findByName(
        teamMemberUserRoleName,
      )

      const user = {
        name: 'Peter',
        email: 'peter@mail.com',
        password: '123456789',
        roleId: teamMemberRole?.id,
      }

      response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)

      // generate team-member token
      response = await request(app).post('/auth').send(user)

      const authBody: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      teamMemberToken = authBody.token
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks status', async () => {
    const response = await request(app)
      .get(`/task/task-status`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    const body: IListTasksStatusControllerResponse =
      response.body as IListTasksStatusControllerResponse

    expect(response.status).toBe(200)

    expect(body.tasksStatus).toHaveLength(insertTasksStatusName.length)
    expect(body.tasksStatus.map(({ name }) => name)).toEqual(
      insertTasksStatusName,
    )
  })

  it('Shouldn`t be able to list all tasks status with a non-team-member account', async () => {
    for (const role of roles) {
      if (role.name === teamMemberUserRoleName) continue

      const user = {
        name: 'non-admin',
        email: `non-team-member-${crypto.randomUUID()}@mail.com`,
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
        .get('/task/task-status')
        .set('Authorization', `Bearer ${authBody.token}`)

      const body: IListTasksStatusControllerResponse =
        response.body as IListTasksStatusControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })
})

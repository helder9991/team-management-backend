import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type IListTasksPriorityControllerResponse } from './ListTasksPriorityController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'
import { insertTasksPriorityName } from 'shared/database/typeorm/seeds/TasksPrioritySeed'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []

let teamMemberToken = ''
let adminToken = ''

describe('List Tasks Priority E2E', () => {
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

  it('Should be able to list all tasks priority', async () => {
    const response = await request(app)
      .get(`/task/task-priority`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    const body: IListTasksPriorityControllerResponse =
      response.body as IListTasksPriorityControllerResponse

    expect(response.status).toBe(200)

    expect(body.tasksPriority).toHaveLength(insertTasksPriorityName.length)
    expect(body.tasksPriority.map(({ name }) => name)).toEqual(
      insertTasksPriorityName,
    )
  })

  it('Should be able to list all tasks priority with every user role', async () => {
    for (const role of roles) {
      const user = {
        name: 'Some user',
        email: `some-user-${crypto.randomUUID()}@mail.com`,
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
        .get('/task/task-priority')
        .set('Authorization', `Bearer ${authBody.token}`)

      expect(response.status).toBe(200)
    }
  })
})

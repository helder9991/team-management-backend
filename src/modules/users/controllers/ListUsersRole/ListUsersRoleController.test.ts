import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type IListUsersRoleControllerResponse } from './ListUsersRoleController'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { adminUserRoleName } from 'modules/users/entities/UserRole'
import { insertTasksPriorityName } from 'shared/database/typeorm/seeds/TasksPrioritySeed'
import { insertUsersRoleName } from 'shared/database/typeorm/seeds/UsersRolesSeed'

const roles: UserRole[] = []

let adminToken = ''

describe('List Users Role E2E', () => {
  beforeAll(async () => {
    try {
      await clearTablesInTest({})

      // generate admin token
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

  it('Should be able to list all users role', async () => {
    const response = await request(app)
      .get(`/user/user-role`)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IListUsersRoleControllerResponse =
      response.body as IListUsersRoleControllerResponse

    expect(response.status).toBe(200)

    expect(body.usersRole).toHaveLength(insertTasksPriorityName.length)
    expect(body.usersRole.map(({ name }) => name)).toEqual(insertUsersRoleName)
  })

  it('Shouldn`t be able to list all users role with a non-admin-member account', async () => {
    for (const role of roles) {
      if (role.name === adminUserRoleName) continue

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
        .get('/user/user-role')
        .set('Authorization', `Bearer ${authBody.token}`)

      const body: IListUsersRoleControllerResponse =
        response.body as IListUsersRoleControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })
})

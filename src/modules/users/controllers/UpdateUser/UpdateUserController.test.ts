import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import { type IUpdateUserControllerResponse } from './UpdateUserController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import type User from 'modules/users/entities/User'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
let createdUser: User

describe('Update User E2E', () => {
  beforeAll(async () => {
    try {
      userRoleRepository = new UserRoleRepository()

      await clearTablesInTest()
      roles = await userRoleRepository.list()
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
      const response = await request(app).post('/user').send(user)

      createdUser = response.body
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a user', async () => {
    const response = await request(app).put(`/user/${createdUser.id}`).send({
      name: 'Peter',
      password: '987654321',
      roleId: roles[1].id,
    })

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

    const body: IUpdateUserControllerResponse =
      response.body as IUpdateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'User doesn`t exist.' })
  })

  it('Shouldn`t be able to update if you pass a wrong parameters', async () => {
    const response = await request(app)
      .put(`/user/${crypto.randomUUID()}`)
      .send({
        name: 1,
        roleId: 1,
        teamId: 1,
      })

    const body: IUpdateUserControllerResponse =
      response.body as IUpdateUserControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

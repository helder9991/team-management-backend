import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import type User from 'modules/users/entities/User'

let userRoleRepository: UserRoleRepository
let roles: UserRole[] = []
const createdUsers: User[] = []

describe('Delete User E2E', () => {
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
      let response = await request(app).post('/user').send({
        name: 'John',
        email: 'john@mail.com',
        password: '123456789',
        roleId: roles[0].id,
      })

      createdUsers.push(response.body)

      response = await request(app).post('/user').send({
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
    let response = await request(app).get('/user')

    expect(response.body).toHaveLength(2)

    response = await request(app).delete(`/user/${createdUsers[0].id}`)

    expect(response.status).toBe(204)

    response = await request(app).get('/user')

    expect(response.body).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing user', async () => {
    const response = await request(app).delete(`/user/${crypto.randomUUID()}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'User doesn`t exist.' })
  })

  it('Shouldn`t be able to delete if you pass a wrong parameters', async () => {
    const nonExistingId = 'non-existing-id'
    const response = await request(app).delete(`/user/${nonExistingId}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type Project from 'modules/project/entities/Project'
import type Team from 'modules/teams/entities/Team'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
const createdProjects: Project[] = []

let adminToken = ''

describe('Delete Project E2E', () => {
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

      const createdTeam: Team = response.body

      response = await request(app)
        .post('/project')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Project 1',
          teamId: createdTeam.id,
        })

      createdProjects.push(response.body)

      response = await request(app)
        .post('/project')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Project 2',
          teamId: createdTeam.id,
        })

      createdProjects.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing project', async () => {
    let response = await request(app)
      .get('/project')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.projects).toHaveLength(2)

    response = await request(app)
      .delete(`/project/${createdProjects[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(204)

    response = await request(app)
      .get('/project')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.projects).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing project', async () => {
    const response = await request(app)
      .delete(`/project/${crypto.randomUUID()}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Project doesn`t exist.' })
  })

  it('Shouldn`t be able to delete a project with a non-admin account', async () => {
    for (const role of roles) {
      if (role.name === adminUserRoleName) continue

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
        .delete(`/project/${createdProjects[0].id}`)
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
      .delete(`/project/${nonExistingId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

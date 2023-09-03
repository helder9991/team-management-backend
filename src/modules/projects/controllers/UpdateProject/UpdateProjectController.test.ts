import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import { type IUpdateProjectControllerResponse } from './UpdateProjectController'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type UserRole from 'modules/users/entities/UserRole'
import type Project from 'modules/projects/entities/Project'
import type Team from 'modules/teams/entities/Team'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
let createdTeam: Team
let createdProject: Project
let adminToken = ''

describe('Update Project E2E', () => {
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

      // Create Projects
      const project = {
        name: 'Project 1',
        teamId: createdTeam.id,
      }

      response = await request(app)
        .post('/project')
        .send(project)
        .set('Authorization', `Bearer ${adminToken}`)

      createdProject = response.body
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to update a project', async () => {
    const updatedProject = {
      name: 'New project name',
      teamId: createdTeam.id,
    }

    const response = await request(app)
      .put(`/project/${createdProject.id}`)
      .send(updatedProject)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateProjectControllerResponse =
      response.body as IUpdateProjectControllerResponse

    expect(response.status).toBe(200)

    expect(body).toMatchObject(updatedProject)
  })

  it('Shouldn`t be able to update a non-existing project', async () => {
    const project = {
      name: 'Project 1',
      teamId: createdTeam.id,
    }

    const response = await request(app)
      .put(`/project/${crypto.randomUUID()}`)
      .send(project)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateProjectControllerResponse =
      response.body as IUpdateProjectControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Project doesn`t exist.' })
  })

  it('Shouldn`t be able to update a project with a non-admin account', async () => {
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

      const project = {
        name: 'Project 1',
        teamId: createdTeam.id,
      }

      response = await request(app)
        .put(`/project/${createdProject.id}`)
        .set('Authorization', `Bearer ${authBody.token}`)
        .send(project)

      expect(response.status).toBe(401)

      expect(response.body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Shouldn`t be able to update if you pass a wrong parameters', async () => {
    const project = {
      name: 1,
      teamId: 1,
    }

    const response = await request(app)
      .put(`/project/1`)
      .send(project)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IUpdateProjectControllerResponse =
      response.body as IUpdateProjectControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

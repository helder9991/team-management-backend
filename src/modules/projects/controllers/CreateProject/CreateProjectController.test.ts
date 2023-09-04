import 'express-async-errors'
import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type ICreateProjectControllerResponse } from './CreateProjectController'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type UserRole from 'modules/users/entities/UserRole'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import TeamRepository from 'modules/teams/repository/typeorm/TeamRepository'
import CreateTeamUseCase from 'modules/teams/useCases/CreateTeam/CreateTeamUseCase'
import type Team from 'modules/teams/entities/Team'
import { adminUserRoleName } from 'modules/users/entities/UserRole'

let createTeam: CreateTeamUseCase

let userRoleRepository: UserRoleRepository
let teamRepository: TeamRepository
let fakeCacheProvider: FakeCacheProvider

let roles: UserRole[] = []
let adminToken = ''

let createdTeam: Team

describe('Create Project E2E', () => {
  beforeAll(async () => {
    try {
      teamRepository = new TeamRepository()
      fakeCacheProvider = new FakeCacheProvider()

      createTeam = new CreateTeamUseCase(teamRepository, fakeCacheProvider)

      await clearTablesInTest({})

      userRoleRepository = new UserRoleRepository()
      roles = await userRoleRepository.list()

      const response = await request(app).post('/auth').send({
        email: 'admin@team.com.br',
        password: 'admin123',
      })

      const body: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      adminToken = body.token

      const team = {
        name: 'Team 1',
      }

      createdTeam = await createTeam.execute(team)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to create a new project', async () => {
    const project = {
      name: 'Project 1',
      teamId: createdTeam.id,
    }
    const response = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(project)

    const body: ICreateProjectControllerResponse =
      response.body as ICreateProjectControllerResponse

    expect(response.status).toBe(201)

    expect(body).toMatchObject(project)
    expect(body).toHaveProperty('id')
  })

  it('Shouldn`t be able to create a new project with a non-admin account', async () => {
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
        .post('/project')
        .set('Authorization', `Bearer ${authBody.token}`)
        .send({
          name: 'Project 1',
          teamId: createdTeam.id,
        })

      const body: ICreateProjectControllerResponse =
        response.body as ICreateProjectControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Should`t be able to create a new project if you pass a wrong parameters', async () => {
    const project = {
      name: 1,
      teamId: createdTeam.id,
    }

    const response = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(project)

    const body: ICreateProjectControllerResponse =
      response.body as ICreateProjectControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

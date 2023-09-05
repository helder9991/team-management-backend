import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type IListProjectsControllerResponse } from './ListProjectsController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import type Team from 'modules/teams/entities/Team'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type Project from 'modules/projects/entities/Project'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
const createdProjects: Project[] = []
let createdTeam: Team

let adminToken = ''

describe('List Projects E2E', () => {
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

      // Create team
      response = await request(app)
        .post('/team')
        .send({
          name: 'Team 1',
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeam = response.body

      // create team-member user
      const teamMemberRole = await userRoleRepository.findByName(
        teamMemberUserRoleName,
      )

      const user = {
        name: 'Peter',
        email: 'peter@mail.com',
        password: '123456789',
        roleId: teamMemberRole?.id,
        teamId: createdTeam.id,
      }

      response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)

      // generate team-member token
      response = await request(app).post('/auth').send(user)

      const authBody: IAuthenticateUserControllerResponse =
        response.body as IAuthenticateUserControllerResponse

      const teamMemberToken = authBody.token

      // Create Projects
      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 1',
          teamId: createdTeam.id,
        })
        .set('Authorization', `Bearer ${teamMemberToken}`)

      createdProjects.push(response.body)

      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 2',
          teamId: createdTeam.id,
        })
        .set('Authorization', `Bearer ${teamMemberToken}`)

      createdProjects.push(response.body)

      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 3',
          teamId: createdTeam.id,
        })
        .set('Authorization', `Bearer ${teamMemberToken}`)

      createdProjects.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all projects', async () => {
    const response = await request(app)
      .get(`/project`)
      .set('Authorization', `Bearer ${adminToken}`)

    const body: IListProjectsControllerResponse =
      response.body as IListProjectsControllerResponse

    expect(response.status).toBe(200)

    expect(body.projects).toHaveLength(3)
    expect(
      body.projects.map(({ createdAt, deletedAt, ...rest }) => {
        return {
          ...rest,
        }
      }),
    ).toEqual(expect.arrayContaining(createdProjects))
  })

  it('Should be able to list all projects with every user role', async () => {
    for (const role of roles) {
      const user = {
        name: 'Some user',
        email: `user-role-${crypto.randomUUID()}@mail.com`,
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
        .get('/project')
        .set('Authorization', `Bearer ${authBody.token}`)
        .send({
          name: 'Project 1',
          teamId: createdTeam.id,
        })

      const body: IListProjectsControllerResponse =
        response.body as IListProjectsControllerResponse

      expect(response.status).toBe(200)

      expect(body.projects).toHaveLength(3)
      expect(
        body.projects.map(({ createdAt, deletedAt, ...rest }) => {
          return {
            ...rest,
          }
        }),
      ).toEqual(expect.arrayContaining(createdProjects))
    }
  })

  it('Shouldn`t be able to list all projects if you pass a wrong parameters', async () => {
    const response = await request(app)
      .get('/project')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        page: -1,
      })
      .send({
        name: 1,
        teamId: 1,
      })

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

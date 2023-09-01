import 'express-async-errors'
import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { type ICreateTeamControllerResponse } from 'modules/teams/controllers/CreateTeam/CreateTeamController'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'
import { type ICreateProjectControllerResponse } from 'modules/projects/controllers/CreateProject/CreateProjectController'
import type Project from 'modules/projects/entities/Project'
import { type ICreateTaskControllerResponse } from '../CreateTask/CreateTaskController'
import type Task from 'modules/tasks/entities/Task'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
let adminToken = ''
let teamMemberToken = ''
let createdProject: Project
let createdTask: Task

describe('Complete Task E2E', () => {
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

      // Create Team
      const team = {
        name: 'Team 1',
      }

      response = await request(app)
        .post('/team')
        .send(team)
        .set('Authorization', `Bearer ${adminToken}`)

      const createdTeam = response.body as ICreateTeamControllerResponse

      // Create Project
      const project = {
        name: 'Project 1',
        teamId: createdTeam.id,
      }

      response = await request(app)
        .post('/project')
        .send(project)
        .set('Authorization', `Bearer ${adminToken}`)

      createdProject = response.body as ICreateProjectControllerResponse

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

      teamMemberToken = authBody.token
    } catch (err) {
      console.error(err)
    }
  })

  beforeEach(async () => {
    try {
      await clearTablesInTest({ tasks: true })

      const task = {
        name: 'Task 1',
        description: 'Task 1 description',
        projectId: createdProject.id,
      }

      const response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(task)

      createdTask = response.body
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to complete a task', async () => {
    const response = await request(app)
      .post(`/task/${createdTask.id}/complete`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    expect(response.status).toBe(204)
  })

  it('Shouldn`t be able to complete a new task with a non-team-member account', async () => {
    for (const role of roles) {
      if (role.name === teamMemberUserRoleName) continue

      const user = {
        name: 'non-team-member',
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
        .post(`/task/${createdTask.id}/complete`)
        .set('Authorization', `Bearer ${authBody.token}`)

      const body: ICreateTaskControllerResponse =
        response.body as ICreateTaskControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Should`t be able to complete a task if you pass a wrong parameters', async () => {
    const response = await request(app)
      .post(`/task/${1}/complete`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    const body: ICreateTaskControllerResponse =
      response.body as ICreateTaskControllerResponse

    expect(response.status).toBe(400)

    expect(body).toMatchObject({ message: 'Validation Fails.' })
  })
})

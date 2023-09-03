import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import type Project from 'modules/projects/entities/Project'
import type Team from 'modules/teams/entities/Team'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'
import type Task from 'modules/tasks/entities/Task'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
let createdTask: Task
let createdProject: Project

let teamMemberToken = ''
let adminToken = ''

describe('Delete Task E2E', () => {
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
      const createdTeams: Team[] = []

      response = await request(app)
        .post('/team')
        .send({
          name: 'Team 1',
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeams.push(response.body)

      response = await request(app)
        .post('/team')
        .send({
          name: 'Team 2',
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdTeams.push(response.body)

      // Create Projects
      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 1',
          teamId: createdTeams[0].id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdProject = response.body

      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 2',
          teamId: createdTeams[1].id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdProject = response.body

      // Create team-member user
      const teamMemberRole = await userRoleRepository.findByName(
        teamMemberUserRoleName,
      )
      const user = {
        name: 'John',
        email: 'john@mail.com',
        password: '123456789',
        roleId: teamMemberRole?.id,
        teamId: createdTeams[1].id,
      }

      response = await request(app)
        .post('/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user)

      // generate team-member tokens
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
      // Create Tasks
      const response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 1',
          description: 'Task 1 description',
          projectId: createdProject.id,
        })

      await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 2',
          description: 'Task 2 description',
          projectId: createdProject.id,
        })

      createdTask = response.body
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to delete a existing task', async () => {
    let response = await request(app)
      .get('/project')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.body.projects).toHaveLength(2)

    response = await request(app)
      .delete(`/task/${createdTask.id}`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    expect(response.status).toBe(204)

    response = await request(app)
      .get('/task')
      .set('Authorization', `Bearer ${teamMemberToken}`)
      .query({
        projectId: createdProject.id,
      })

    expect(response.body.tasks).toHaveLength(1)
  })

  it('Shouldn`t be able to delete a non-existing task', async () => {
    const response = await request(app)
      .delete(`/task/${crypto.randomUUID()}`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Task doesn`t exist.' })
  })

  it('Shouldn`t be able to delete a task with a non-team-member account', async () => {
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
        .delete(`/task/${createdProject.id}`)
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
      .delete(`/task/${nonExistingId}`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

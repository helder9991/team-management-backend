import request from 'supertest'
import crypto from 'crypto'
import app from '../../../../app'
import { type IListTasksControllerResponse } from './ListTasksController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'utils/clearTablesInTest'
import type Team from 'modules/teams/entities/Team'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'
import { type ICreateTeamControllerResponse } from 'modules/teams/controllers/CreateTeam/CreateTeamController'
import { type ICreateProjectControllerResponse } from 'modules/projects/controllers/CreateProject/CreateProjectController'
import type Task from 'modules/tasks/entities/Task'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
const createdTasks: Task[] = []
let createdTeam: Team

let teamMemberToken = ''
let adminToken = ''

describe('List Tasks E2E', () => {
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

      createdTeam = response.body as ICreateTeamControllerResponse

      // Create Project
      const project = {
        name: 'Project 1',
        teamId: createdTeam.id,
      }

      response = await request(app)
        .post('/project')
        .send(project)
        .set('Authorization', `Bearer ${adminToken}`)

      const createdProject = response.body as ICreateProjectControllerResponse

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

      // Create Tasks
      response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 1',
          description: 'Task 1 description',
          projectId: createdProject.id,
        })

      createdTasks.push(response.body)

      response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 2',
          projectId: createdProject.id,
        })

      createdTasks.push(response.body)

      response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 3',
          projectId: createdProject.id,
        })

      createdTasks.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks', async () => {
    const response = await request(app)
      .get(`/task`)
      .set('Authorization', `Bearer ${teamMemberToken}`)

    const body: IListTasksControllerResponse =
      response.body as IListTasksControllerResponse

    expect(response.status).toBe(200)

    expect(body.tasks).toHaveLength(3)
    expect(
      body.tasks.map(({ taskStatus, createdAt, deletedAt, ...rest }) => {
        return {
          ...rest,
        }
      }),
    ).toEqual(
      expect.arrayContaining(
        createdTasks.map(
          ({ taskStatus, createdAt, deletedAt, description, ...rest }) => {
            return {
              description: description ?? null,
              ...rest,
            }
          },
        ),
      ),
    )
  })

  it('Shouldn`t be able to list all tasks with a non-team-member account', async () => {
    for (const role of roles) {
      if (role.name === teamMemberUserRoleName) continue

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
        .get('/task')
        .set('Authorization', `Bearer ${authBody.token}`)
        .send({
          name: 'Task 1',
          projectId: crypto.randomUUID(),
        })

      const body: IListTasksControllerResponse =
        response.body as IListTasksControllerResponse

      expect(response.status).toBe(401)

      expect(body).toMatchObject({
        message: 'This user doesn`t have permission to do this action.',
      })
    }
  })

  it('Shouldn`t be able to list all projects if you pass a wrong parameters', async () => {
    const response = await request(app)
      .get('/task')
      .set('Authorization', `Bearer ${teamMemberToken}`)
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

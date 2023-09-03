import request from 'supertest'
import crypto from 'crypto'
import app from 'shared/app'
import { type IListTasksControllerResponse } from './ListTasksController'
import UserRoleRepository from 'modules/users/repository/typeorm/UserRoleRepository'
import type UserRole from 'modules/users/entities/UserRole'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import type Team from 'modules/teams/entities/Team'
import { type IAuthenticateUserControllerResponse } from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'
import { teamMemberUserRoleName } from 'modules/users/entities/UserRole'
import { type ICreateTeamControllerResponse } from 'modules/teams/controllers/CreateTeam/CreateTeamController'
import type Task from 'modules/tasks/entities/Task'
import type Project from 'modules/projects/entities/Project'

let userRoleRepository: UserRoleRepository

let roles: UserRole[] = []
const createdTasks: Task[] = []
const createdProjects: Project[] = []
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

      // Create Projects

      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 1',
          teamId: createdTeam.id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdProjects.push(response.body)

      response = await request(app)
        .post('/project')
        .send({
          name: 'Project 2',
          teamId: createdTeam.id,
        })
        .set('Authorization', `Bearer ${adminToken}`)

      createdProjects.push(response.body)

      // Create team-member user
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

      // Create Tasks
      response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 1',
          description: 'Task 1 description',
          projectId: createdProjects[0].id,
        })

      createdTasks.push(response.body)

      response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 2',
          projectId: createdProjects[0].id,
        })

      createdTasks.push(response.body)

      response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({
          name: 'Task 3',
          projectId: createdProjects[1].id,
        })

      createdTasks.push(response.body)
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks by ProjectId', async () => {
    const response = await request(app)
      .get(`/task`)
      .set('Authorization', `Bearer ${teamMemberToken}`)
      .query({
        projectId: createdTasks[0].projectId,
      })

    const body: IListTasksControllerResponse =
      response.body as IListTasksControllerResponse

    expect(response.status).toBe(200)

    expect(body.tasks).toHaveLength(2)
    expect(
      body.tasks.map(
        ({ taskStatus, createdAt, deletedAt, taskPriority, ...rest }) => {
          return {
            ...rest,
          }
        },
      ),
    ).toEqual(
      expect.arrayContaining(
        createdTasks
          .filter((task) => task.projectId === createdTasks[0].projectId)
          .map(({ taskStatus, createdAt, deletedAt, description, ...rest }) => {
            return {
              description: description ?? null,
              ...rest,
            }
          }),
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

    expect(response.status).toBe(400)

    expect(response.body).toMatchObject({ message: 'Validation Fails.' })
  })
})

import typeORMConnection from 'database/typeorm'
import AppError from './AppError'
import User from 'modules/users/entities/User'
import { Not } from 'typeorm'
import Team from 'modules/teams/entities/Team'
import Project from 'modules/projects/entities/Project'
import Task from 'modules/tasks/entities/Task'

interface IClearTables {
  users?: boolean
  tasks?: boolean
  projects?: boolean
  teams?: boolean
}

async function clearTablesInTest(tables: IClearTables): Promise<void> {
  if (process.env.NODE_ENV !== 'test')
    throw new AppError(
      'Está função so deve ser rodada em ambiente de testes',
      500,
    )

  if (!typeORMConnection.isInitialized) await typeORMConnection.initialize()

  // delete all users except admin
  const admin = await typeORMConnection
    .getRepository(User)
    .findOneBy({ email: 'admin@team.com.br' })
  if (admin === null) {
    console.error('User admin not found')
    return
  }

  const deleteAll = Object.keys(tables).length === 0

  try {
    if (deleteAll || tables.users === true)
      await typeORMConnection.getRepository(User).delete({ id: Not(admin.id) })

    if (deleteAll || tables.tasks === true)
      await typeORMConnection.getRepository(Task).delete({})

    if (deleteAll || tables.projects === true)
      await typeORMConnection.getRepository(Project).delete({})

    if (deleteAll || tables.teams === true)
      await typeORMConnection.getRepository(Team).delete({})
  } catch (err) {
    console.error(err)
  }
}

export default clearTablesInTest

import typeORMConnection from 'database/typeorm'
import AppError from './AppError'
import User from 'modules/users/entities/User'
import { Not } from 'typeorm'
import Team from 'modules/teams/entities/Team'
import Project from 'modules/project/entities/Project'
import Task from 'modules/tasks/entities/Task'

async function clearTablesInTest(): Promise<void> {
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
  try {
    await typeORMConnection.getRepository(User).delete({ id: Not(admin.id) })
    await typeORMConnection.getRepository(Task).delete({})
    await typeORMConnection.getRepository(Project).delete({})
    await typeORMConnection.getRepository(Team).delete({})
  } catch (err) {
    console.error(err)
  }
}

export default clearTablesInTest

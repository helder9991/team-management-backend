import crypto from 'crypto'
import typeORMConnection from '..'
import {
  completedTaskStatus,
  inProgressTaskStatus,
  readyTaskStatus,
} from '../../../modules/tasks/entities/TaskStatus'

class TasksStatusSeed {
  async run(): Promise<void> {
    const sqlQuery =
      'INSERT INTO tasks_status (task_status_id, task_status_name, task_status_created_at) VALUES ($1, $2, $3)'
    const names = [readyTaskStatus, inProgressTaskStatus, completedTaskStatus]

    for (const name of names) {
      try {
        await typeORMConnection.query(sqlQuery, [
          crypto.randomUUID(),
          name,
          new Date(),
        ])
        console.log(`TasksStatus: Add Row '${name}'`)
      } catch (err) {
        console.log(`TasksStatus: Row '${name}' already exists`)
      }
    }
  }
}

export default new TasksStatusSeed()

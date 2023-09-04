import crypto from 'crypto'
import typeORMConnection from '..'
import {
  completedTaskStatus,
  inProgressTaskStatus,
  readyTaskStatus,
} from '../../../../modules/tasks/entities/TaskStatus'

export const insertTasksStatusName = [
  readyTaskStatus,
  inProgressTaskStatus,
  completedTaskStatus,
]

class TasksStatusSeed {
  async run(silent: boolean): Promise<void> {
    const sqlQuery =
      'INSERT INTO tasks_status (task_status_id, task_status_name, task_status_created_at) VALUES ($1, $2, $3)'

    for (const name of insertTasksStatusName) {
      try {
        await typeORMConnection.query(sqlQuery, [
          crypto.randomUUID(),
          name,
          new Date(),
        ])
        if (!silent) console.log(`TasksStatus: Add Row '${name}'`)
      } catch (err) {
        if (!silent) console.log(`TasksStatus: Row '${name}' already exists`)
      }
    }
  }
}

export default new TasksStatusSeed()

import crypto from 'crypto'
import typeORMConnection from '..'
import {
  highTaskPriority,
  lowTaskPriority,
  normalTaskPriority,
} from '../../../modules/tasks/entities/TaskPriority'

class TasksPrioritySeed {
  async run(silent: boolean): Promise<void> {
    const sqlQuery =
      'INSERT INTO tasks_priority (task_priority_id, task_priority_name, task_priority_created_at) VALUES ($1, $2, $3)'
    const names = [lowTaskPriority, normalTaskPriority, highTaskPriority]

    for (const name of names) {
      try {
        await typeORMConnection.query(sqlQuery, [
          crypto.randomUUID(),
          name,
          new Date(),
        ])

        if (!silent) console.log(`TasksPriority: Add Row '${name}'`)
      } catch (err) {
        if (!silent) console.log(`TasksPriority: Row '${name}' already exists`)
      }
    }
  }
}

export default new TasksPrioritySeed()

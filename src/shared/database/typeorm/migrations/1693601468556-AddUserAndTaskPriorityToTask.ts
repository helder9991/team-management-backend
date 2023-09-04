import { normalTaskPriority } from '../../../../modules/tasks/entities/TaskPriority'
import {
  type MigrationInterface,
  type QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm'

export class AddUserAndTaskPriorityToTask1693601468556
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'user_id',
        type: 'varchar(36)',
        isNullable: true,
      }),
    )

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'task_priority_id',
        type: 'varchar(36)',
        isNullable: true,
      }),
    )

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
      }),
    )

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['task_priority_id'],
        referencedTableName: 'tasks_priority',
        referencedColumnNames: ['task_priority_id'],
      }),
    )

    await queryRunner.query(`
        UPDATE tasks 
        SET task_priority_id = tasks_priority.task_priority_id
        FROM tasks_priority
        WHERE task_priority_name = '${normalTaskPriority}'
    `)

    await queryRunner.changeColumn(
      'tasks',
      'task_priority_id',
      new TableColumn({
        name: 'task_priority_id',
        type: 'varchar(36)',
        isNullable: false,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('tasks', ['user_id', 'task_priority_id'])
  }
}

import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm'

export class CreateTasks1693503376502 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'task_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'task_name',
            type: 'varchar(20)',
            isNullable: false,
          },
          {
            name: 'task_description',
            type: 'varchar(50)',
            isNullable: true,
          },
          {
            name: 'project_id',
            type: 'varchar(36)',
            isNullable: false,
          },
          {
            name: 'task_status_id',
            type: 'varchar(36)',
            isNullable: false,
          },
          {
            name: 'task_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'task_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )

    await queryRunner.createForeignKeys('tasks', [
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['project_id'],
      }),
    ])

    await queryRunner.createForeignKeys('tasks', [
      new TableForeignKey({
        columnNames: ['task_status_id'],
        referencedTableName: 'tasks_status',
        referencedColumnNames: ['task_status_id'],
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks')
  }
}

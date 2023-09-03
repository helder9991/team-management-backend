import { Table, type MigrationInterface, type QueryRunner } from 'typeorm'

export class CreateTasksPriority1693600415057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tasks_priority',
        columns: [
          {
            name: 'task_priority_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'task_priority_name',
            type: 'varchar(20)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'task_priority_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'task_priority_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks_priority')
  }
}

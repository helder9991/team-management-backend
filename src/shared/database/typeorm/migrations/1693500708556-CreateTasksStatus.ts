import { type MigrationInterface, type QueryRunner, Table } from 'typeorm'

export class CreateTasksStatus1693500708556 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tasks_status',
        columns: [
          {
            name: 'task_status_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'task_status_name',
            type: 'varchar(20)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'task_status_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'task_status_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('task_status')
  }
}

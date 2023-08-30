import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm'

export class CreateProjects1693436229184 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'project_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'project_name',
            type: 'varchar(20)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'team_id',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'project_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'project_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )

    await queryRunner.createForeignKeys('projects', [
      new TableForeignKey({
        columnNames: ['team_id'],
        referencedTableName: 'teams',
        referencedColumnNames: ['team_id'],
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('projects')
  }
}

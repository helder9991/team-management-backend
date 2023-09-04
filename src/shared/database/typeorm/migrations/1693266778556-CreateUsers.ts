import {
  TableForeignKey,
  type MigrationInterface,
  type QueryRunner,
  Table,
} from 'typeorm'

export class CreateUsers1693266778556 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'user_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'user_name',
            type: 'varchar(20)',
            isNullable: false,
          },
          {
            name: 'user_email',
            type: 'varchar(50)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'user_password',
            type: 'varchar(100)',
            isNullable: false,
          },
          {
            name: 'user_role_id',
            type: 'varchar(36)',
            isNullable: false,
          },
          {
            name: 'team_id',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'user_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'user_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )

    await queryRunner.createForeignKeys('users', [
      new TableForeignKey({
        columnNames: ['team_id'],
        referencedTableName: 'teams',
        referencedColumnNames: ['team_id'],
      }),
    ])

    await queryRunner.createForeignKeys('users', [
      new TableForeignKey({
        columnNames: ['user_role_id'],
        referencedTableName: 'users_roles',
        referencedColumnNames: ['user_role_id'],
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}

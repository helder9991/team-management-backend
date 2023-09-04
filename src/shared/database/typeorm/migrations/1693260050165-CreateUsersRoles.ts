import { Table, type MigrationInterface, type QueryRunner } from 'typeorm'

export class CreateUsersRoles1693260050165 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users_roles',
        columns: [
          {
            name: 'user_role_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'user_role_name',
            type: 'varchar(20)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'user_role_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'user_role_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users_roles')
  }
}

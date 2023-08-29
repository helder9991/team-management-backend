import { type MigrationInterface, type QueryRunner, Table } from 'typeorm'

export class CreateTeams1693266091463 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        columns: [
          {
            name: 'team_id',
            type: 'varchar(36)',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'team_name',
            type: 'varchar(20)',
            isNullable: false,
          },
          {
            name: 'team_created_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'team_deleted_at',
            type: 'timestamp',
            default: null,
            isNullable: true,
          },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('teams')
  }
}

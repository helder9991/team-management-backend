import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm'

@Entity('teams')
class Team {
  @PrimaryColumn({ name: 'team_id', type: 'uuid' })
  id: string

  @Column({ name: 'team_name' })
  name: string

  @CreateDateColumn({ name: 'team_created_at' })
  createdAt?: Date

  @DeleteDateColumn({ name: 'team_deleted_at', nullable: true })
  deletedAt?: Date
}

export default Team

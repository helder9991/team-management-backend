import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm'

@Entity('projects')
class Project {
  @PrimaryColumn({ name: 'project_id', type: 'uuid' })
  id: string

  @Column({ name: 'project_name' })
  name: string

  @Column({ name: 'team_id' })
  teamId: string

  @CreateDateColumn({ name: 'project_created_at' })
  createdAt?: Date

  @DeleteDateColumn({ name: 'project_deleted_at', nullable: true })
  deletedAt?: Date
}

export default Project

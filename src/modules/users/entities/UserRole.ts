import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm'

@Entity('users_roles')
class UserRole {
  @PrimaryColumn({ name: 'user_role_id', type: 'uuid' })
  id: string

  @Column({ name: 'user_role_name' })
  name: string

  @CreateDateColumn({ name: 'user_role_created_at' })
  createdAt?: Date

  @DeleteDateColumn({ name: 'user_role_deleted_at', nullable: true })
  deletedAt?: Date
}

export default UserRole

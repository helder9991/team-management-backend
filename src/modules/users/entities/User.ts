import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('users')
class User {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  id: string

  @Column({ name: 'user_name' })
  name: string

  @Column({ name: 'user_email' })
  email: string

  @Column({ name: 'user_password' })
  password: string

  @Column({ name: 'user_role_id' })
  roleId: string

  @Column({ name: 'team_id', nullable: true })
  teamId?: string

  @Column({ name: 'user_created_at' })
  createdAt?: Date

  @Column({ name: 'user_deleted_at', nullable: true })
  deletedAt?: Date
}

export default User

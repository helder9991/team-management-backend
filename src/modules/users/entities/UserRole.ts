import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm'

export type IUserRoleName =
  | 'Administrador'
  | 'Membro da Equipe'
  | 'Usuário Comum'

export const adminUserRoleName = 'Administrador'
export const teamMemberUserRoleName = 'Membro da Equipe'
export const commonUserUserRoleName = 'Usuário Comum'

@Entity('users_roles')
class UserRole {
  @PrimaryColumn({ name: 'user_role_id', type: 'uuid' })
  id: string

  @Column({ name: 'user_role_name' })
  name: string

  @CreateDateColumn({ name: 'user_role_created_at', select: false })
  createdAt?: Date

  @DeleteDateColumn({
    name: 'user_role_deleted_at',
    nullable: true,
    select: false,
  })
  deletedAt?: Date
}

export default UserRole

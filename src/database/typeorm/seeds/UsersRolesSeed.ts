import crypto from 'crypto'
import typeORMConnection from '..'
import {
  adminUserRoleName,
  commonUserUserRoleName,
  teamMemberUserRoleName,
} from '../../../modules/users/entities/UserRole'

class UsersRolesSeed {
  async run(): Promise<void> {
    const sqlQuery =
      'INSERT INTO users_roles (user_role_id, user_role_name, user_role_created_at) VALUES ($1, $2, $3)'
    const names = [
      adminUserRoleName,
      teamMemberUserRoleName,
      commonUserUserRoleName,
    ]

    for (const name of names) {
      try {
        await typeORMConnection.query(sqlQuery, [
          crypto.randomUUID(),
          name,
          new Date(),
        ])
        console.log(`UsersRoles: Add Row '${name}'`)
      } catch (err) {
        console.log(`UsersRoles: Row '${name}' already exists`)
      }
    }
  }
}

export default new UsersRolesSeed()

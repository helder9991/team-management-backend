import crypto from 'crypto'
import typeORMConnection from '..'
import {
  adminUserRoleName,
  commonUserUserRoleName,
  teamMemberUserRoleName,
} from '../../../../modules/users/entities/UserRole'

export const insertUsersRoleName = [
  adminUserRoleName,
  teamMemberUserRoleName,
  commonUserUserRoleName,
]

class UsersRolesSeed {
  async run(silent: boolean): Promise<void> {
    const sqlQuery =
      'INSERT INTO users_roles (user_role_id, user_role_name, user_role_created_at) VALUES ($1, $2, $3)'

    for (const name of insertUsersRoleName) {
      try {
        await typeORMConnection.query(sqlQuery, [
          crypto.randomUUID(),
          name,
          new Date(),
        ])

        if (!silent) console.log(`UsersRoles: Add Row '${name}'`)
      } catch (err) {
        if (!silent) console.log(`UsersRoles: Row '${name}' already exists`)
      }
    }
  }
}

export default new UsersRolesSeed()

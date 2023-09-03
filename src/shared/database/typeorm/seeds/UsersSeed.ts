import crypto from 'crypto'
import typeORMConnection from '..'
import UserRole, {
  adminUserRoleName,
} from '../../../../modules/users/entities/UserRole'
import { hash } from 'bcryptjs'

class UsersSeed {
  async run(silent: boolean): Promise<void> {
    const sqlQuery =
      'INSERT INTO users (user_id, user_name, user_email, user_password, user_role_id, user_created_at) VALUES ($1, $2, $3, $4, $5, $6)'

    try {
      const adminRole = await typeORMConnection
        .getRepository(UserRole)
        .findOne({ where: { name: adminUserRoleName } })

      await typeORMConnection.query(sqlQuery, [
        crypto.randomUUID(),
        'Administrador',
        'admin@team.com.br',
        await hash('admin123', 8),
        adminRole?.id,
        new Date(),
      ])

      if (!silent) console.log(`Users: Add Row 'admin@team.com.br'`)
    } catch (err) {
      if (!silent) console.log(`Users: Row 'Administrador' already exists`)
    }
  }
}

export default new UsersSeed()

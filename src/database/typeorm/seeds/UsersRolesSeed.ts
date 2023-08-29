import crypto from 'crypto'
import typeORMConnection from '..'

class UsersRolesSeed {
  async run(): Promise<void> {
    const sqlQuery =
      'INSERT INTO users_roles (user_role_id, user_role_name, user_role_created_at) VALUES ($1, $2, $3)'
    const names = ['Administrador', 'Membro da Equipe', 'Usuário Comum']

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

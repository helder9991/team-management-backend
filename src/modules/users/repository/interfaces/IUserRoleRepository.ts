import type UserRole from 'modules/users/entities/UserRole'

interface IUserRoleRepository {
  list: () => Promise<UserRole[]>
  findById: (id: string) => Promise<UserRole | null>
}

export default IUserRoleRepository

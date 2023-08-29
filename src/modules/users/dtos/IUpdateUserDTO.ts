interface IUpdateUserDTO {
  id: string
  name: string
  isNewPassword?: boolean
  password: string
  roleId: string
  teamId?: string
}

export default IUpdateUserDTO

interface ICreateUserDTO {
  name: string
  email: string
  password: string
  roleId: string
  teamId?: string
}

export default ICreateUserDTO

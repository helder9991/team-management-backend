import type IAuhtenticateUserDTO from 'modules/users/dtos/IAuthenticateUserDTO'

export interface IToken {
  token: string
}

interface IAuthenticateRepository {
  create: (data: IAuhtenticateUserDTO) => Promise<IToken>
}

export default IAuthenticateRepository

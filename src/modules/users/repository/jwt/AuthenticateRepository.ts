import type IAuthenticateRepository from '../interfaces/IAuthenticateRepository'
import type IAuhtenticateUserDTO from '../../dtos/IAuthenticateUserDTO'
import { type IToken } from '../interfaces/IAuthenticateRepository'
import { compare } from 'bcryptjs'
import AppError from 'shared/utils/AppError'
import authConfig from 'shared/config/auth'
import { sign } from 'jsonwebtoken'

class AuthenticateRepository implements IAuthenticateRepository {
  async create({
    id,
    roleId,
    recivedPassword,
    password,
  }: IAuhtenticateUserDTO): Promise<IToken> {
    const passwordMatched = await compare(recivedPassword, password)

    if (!passwordMatched)
      throw new AppError('Login or password is invalid.', 400)

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({ roleId }, secret, {
      subject: id,
      expiresIn,
    })

    return { token }
  }
}

export default AuthenticateRepository

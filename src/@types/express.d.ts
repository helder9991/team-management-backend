interface IUser {
  id: string
  roleId: string
  teamId?: string
}

declare namespace Express {
  interface Request {
    user: IUser
  }
}

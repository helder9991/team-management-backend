interface IUser {
  id: string
  roleId: string
}

declare namespace Express {
  interface Request {
    user: IUser
  }
}

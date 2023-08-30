import { type Request, type Response, Router } from 'express'
import AuthenticateUserController from 'modules/users/controllers/AuthenticateUser/AuthenticateUserController'

const authRoutes = Router()

authRoutes.post('/', (req: Request, res: Response) =>
  AuthenticateUserController.handle(req, res),
)

export default authRoutes

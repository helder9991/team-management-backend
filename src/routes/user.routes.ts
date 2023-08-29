import { type Request, type Response, Router } from 'express'
import CreateUserController from 'modules/users/controllers/CreateUser/CreateUserController'

const userRoutes = Router()

userRoutes.post('/', (req: Request, res: Response) =>
  CreateUserController.handle(req, res),
)

export default userRoutes

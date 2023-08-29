import { type Request, type Response, Router } from 'express'
import CreateUserController from 'modules/users/controllers/CreateUser/CreateUserController'
import DeleteUserController from 'modules/users/controllers/DeleteUser/DeleteUserController'
import ListUsersController from 'modules/users/controllers/ListUsers/ListUsersController'
import UpdateUserController from 'modules/users/controllers/UpdateUser/UpdateUserController'

const userRoutes = Router()

userRoutes.post('/', (req: Request, res: Response) =>
  CreateUserController.handle(req, res),
)

userRoutes.put('/:id', (req: Request, res: Response) =>
  UpdateUserController.handle(req, res),
)

userRoutes.get('/', (req: Request, res: Response) =>
  ListUsersController.handle(req, res),
)

userRoutes.delete('/:id', (req: Request, res: Response) =>
  DeleteUserController.handle(req, res),
)

export default userRoutes

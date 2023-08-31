import { type Request, type Response, Router } from 'express'
import CreateTaskController from 'modules/tasks/controllers/CreateTask/CreateTaskController'

const taskRoutes = Router()

taskRoutes.post('/', (req: Request, res: Response) =>
  CreateTaskController.handle(req, res),
)

export default taskRoutes

import { type Request, type Response, Router } from 'express'
import CompleteTaskController from 'modules/tasks/controllers/CompleteTask/CompleteTaskController'
import CreateTaskController from 'modules/tasks/controllers/CreateTask/CreateTaskController'
import DeleteTaskController from 'modules/tasks/controllers/DeleteTask/DeleteTaskController'
import ListTasksController from 'modules/tasks/controllers/ListTasks/ListTasksController'
import ReadyTaskController from 'modules/tasks/controllers/ReadyTask/ReadyTaskController'

const taskRoutes = Router()

taskRoutes.post('/', (req: Request, res: Response) =>
  CreateTaskController.handle(req, res),
)

taskRoutes.get('/', (req: Request, res: Response) =>
  ListTasksController.handle(req, res),
)

taskRoutes.post('/:id/ready', (req: Request, res: Response) =>
  ReadyTaskController.handle(req, res),
)

taskRoutes.post('/:id/complete', (req: Request, res: Response) =>
  CompleteTaskController.handle(req, res),
)

taskRoutes.delete('/:id', (req: Request, res: Response) =>
  DeleteTaskController.handle(req, res),
)

export default taskRoutes

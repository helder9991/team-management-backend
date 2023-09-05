import { type Request, type Response, Router } from 'express'
import CompleteTaskController from 'modules/tasks/controllers/CompleteTask/CompleteTaskController'
import CreateTaskController from 'modules/tasks/controllers/CreateTask/CreateTaskController'
import DeleteTaskController from 'modules/tasks/controllers/DeleteTask/DeleteTaskController'
import InProgressTaskController from 'modules/tasks/controllers/InProgressTask/InProgressTaskController'
import ListTasksController from 'modules/tasks/controllers/ListTasks/ListTasksController'
import ListTasksPriorityController from 'modules/tasks/controllers/ListTasksPriority/ListTasksPriorityController'
import ListTasksStatusController from 'modules/tasks/controllers/ListTasksStatus/ListTasksStatusController'
import ReadyTaskController from 'modules/tasks/controllers/ReadyTask/ReadyTaskController'
import UpdateTaskController from 'modules/tasks/controllers/UpdateTask/UpdateTaskController'
import ensureTeamMember from 'shared/middlewares/ensureTeamMember'

const taskRoutes = Router()

taskRoutes.post('/', ensureTeamMember, (req: Request, res: Response) =>
  CreateTaskController.handle(req, res),
)

taskRoutes.get('/', (req: Request, res: Response) =>
  ListTasksController.handle(req, res),
)

taskRoutes.put('/:id', ensureTeamMember, (req: Request, res: Response) =>
  UpdateTaskController.handle(req, res),
)

taskRoutes.post('/:id/ready', ensureTeamMember, (req: Request, res: Response) =>
  ReadyTaskController.handle(req, res),
)

taskRoutes.post(
  '/:id/in-progress',
  ensureTeamMember,
  (req: Request, res: Response) => InProgressTaskController.handle(req, res),
)

taskRoutes.post(
  '/:id/complete',
  ensureTeamMember,
  (req: Request, res: Response) => CompleteTaskController.handle(req, res),
)

taskRoutes.delete('/:id', ensureTeamMember, (req: Request, res: Response) =>
  DeleteTaskController.handle(req, res),
)

taskRoutes.get('/task-status', (req: Request, res: Response) =>
  ListTasksStatusController.handle(req, res),
)

taskRoutes.get('/task-priority', (req: Request, res: Response) =>
  ListTasksPriorityController.handle(req, res),
)

export default taskRoutes

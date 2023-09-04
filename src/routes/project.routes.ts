import { type Request, type Response, Router } from 'express'
import CreateProjectController from 'modules/projects/controllers/CreateProject/CreateProjectController'
import DeleteProjectController from 'modules/projects/controllers/DeleteTeam/DeleteProjectController'
import ListProjectsController from 'modules/projects/controllers/ListProjects/ListProjectsController'
import UpdateProjectController from 'modules/projects/controllers/UpdateProject/UpdateProjectController'

const projectRoutes = Router()

projectRoutes.post('/', (req: Request, res: Response) =>
  CreateProjectController.handle(req, res),
)

projectRoutes.put('/:id', (req: Request, res: Response) =>
  UpdateProjectController.handle(req, res),
)

projectRoutes.get('/', (req: Request, res: Response) =>
  ListProjectsController.handle(req, res),
)

projectRoutes.delete('/:id', (req: Request, res: Response) =>
  DeleteProjectController.handle(req, res),
)

export default projectRoutes

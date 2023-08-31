import { type Request, type Response, Router } from 'express'
import CreateProjectController from 'modules/project/controllers/CreateProject/CreateProjectController'
import ListProjectsController from 'modules/project/controllers/ListProjects/ListProjectsController'

const projectRoutes = Router()

projectRoutes.post('/', (req: Request, res: Response) =>
  CreateProjectController.handle(req, res),
)

projectRoutes.get('/', (req: Request, res: Response) =>
  ListProjectsController.handle(req, res),
)

export default projectRoutes

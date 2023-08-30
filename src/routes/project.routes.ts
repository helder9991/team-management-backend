import { type Request, type Response, Router } from 'express'
import CreateProjectController from 'modules/project/controllers/CreateProject/CreateProjectController'

const projectRoutes = Router()

projectRoutes.post('/', (req: Request, res: Response) =>
  CreateProjectController.handle(req, res),
)

export default projectRoutes

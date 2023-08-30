import { type Request, type Response, Router } from 'express'
import ensureAdministrator from 'middlewares/ensureAdministrator'
import CreateTeamController from 'modules/teams/controllers/CreateTeam/CreateTeamController'

const teamRoutes = Router()

teamRoutes.post('/', ensureAdministrator, (req: Request, res: Response) =>
  CreateTeamController.handle(req, res),
)

export default teamRoutes

import { type Request, type Response, Router } from 'express'
import ensureAdministrator from 'middlewares/ensureAdministrator'
import CreateTeamController from 'modules/teams/controllers/CreateTeam/CreateTeamController'
import ListTeamsController from 'modules/teams/controllers/ListTeams/ListTeamsController'

const teamRoutes = Router()

teamRoutes.post('/', ensureAdministrator, (req: Request, res: Response) =>
  CreateTeamController.handle(req, res),
)

teamRoutes.get('/', ensureAdministrator, (req: Request, res: Response) =>
  ListTeamsController.handle(req, res),
)

export default teamRoutes

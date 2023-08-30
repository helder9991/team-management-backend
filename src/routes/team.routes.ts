import { type Request, type Response, Router } from 'express'
import ensureAdministrator from 'middlewares/ensureAdministrator'
import CreateTeamController from 'modules/teams/controllers/CreateTeam/CreateTeamController'
import DeleteTeamController from 'modules/teams/controllers/DeleteTeam/DeleteTeamController'
import ListTeamsController from 'modules/teams/controllers/ListTeams/ListTeamsController'

const teamRoutes = Router()

teamRoutes.post('/', ensureAdministrator, (req: Request, res: Response) =>
  CreateTeamController.handle(req, res),
)

teamRoutes.get('/', ensureAdministrator, (req: Request, res: Response) =>
  ListTeamsController.handle(req, res),
)

teamRoutes.delete('/:id', ensureAdministrator, (req: Request, res: Response) =>
  DeleteTeamController.handle(req, res),
)

export default teamRoutes

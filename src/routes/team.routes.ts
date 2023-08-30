import { type Request, type Response, Router } from 'express'
import CreateTeamController from 'modules/teams/controllers/CreateTeam/CreateTeamController'
import DeleteTeamController from 'modules/teams/controllers/DeleteTeam/DeleteTeamController'
import ListTeamsController from 'modules/teams/controllers/ListTeams/ListTeamsController'
import UpdateTeamController from 'modules/teams/controllers/UpdateTeam/UpdateTeamController'

const teamRoutes = Router()

teamRoutes.post('/', (req: Request, res: Response) =>
  CreateTeamController.handle(req, res),
)

teamRoutes.put('/:id', (req: Request, res: Response) =>
  UpdateTeamController.handle(req, res),
)

teamRoutes.get('/', (req: Request, res: Response) =>
  ListTeamsController.handle(req, res),
)

teamRoutes.delete('/:id', (req: Request, res: Response) =>
  DeleteTeamController.handle(req, res),
)

export default teamRoutes

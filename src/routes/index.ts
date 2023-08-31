import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import teamRoutes from './team.routes'
import projectRoutes from './project.routes'
import taskRoutes from './tasks.routes'
import ensureAuthenticated from 'middlewares/ensureAuthenticated'
import ensureAdministrator from 'middlewares/ensureAdministrator'
import ensureTeamMember from 'middlewares/ensureTeamMember'

const routes = Router()

routes.use('/user', ensureAuthenticated, userRoutes)
routes.use('/auth', authRoutes)
routes.use('/team', ensureAuthenticated, ensureAdministrator, teamRoutes)
routes.use('/project', ensureAuthenticated, ensureAdministrator, projectRoutes)
routes.use('/task', ensureAuthenticated, ensureTeamMember, taskRoutes)

export default routes

import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import ensureAuthenticated from 'middlewares/ensureAuthenticated'
import teamRoutes from './team.routes'
import ensureAdministrator from 'middlewares/ensureAdministrator'
import projectRoutes from './project.routes'

const routes = Router()

routes.use('/user', ensureAuthenticated, userRoutes)
routes.use('/auth', authRoutes)
routes.use('/team', ensureAuthenticated, ensureAdministrator, teamRoutes)
routes.use('/project', ensureAuthenticated, ensureAdministrator, projectRoutes)

export default routes

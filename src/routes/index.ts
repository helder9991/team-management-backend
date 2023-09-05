import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import teamRoutes from './team.routes'
import projectRoutes from './project.routes'
import taskRoutes from './tasks.routes'
import ensureAuthenticated from 'shared/middlewares/ensureAuthenticated'
import ensureAdministrator from 'shared/middlewares/ensureAdministrator'

const routes = Router()

routes.use('/user', ensureAuthenticated, userRoutes)
routes.use('/auth', authRoutes)
routes.use('/team', ensureAuthenticated, ensureAdministrator, teamRoutes)
routes.use('/project', ensureAuthenticated, projectRoutes)
routes.use('/task', ensureAuthenticated, taskRoutes)

export default routes

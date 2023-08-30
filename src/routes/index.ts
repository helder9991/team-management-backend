import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import ensureAuthenticated from 'middlewares/ensureAuthenticated'
import teamRoutes from './team.routes'

const routes = Router()

routes.use('/user', ensureAuthenticated, userRoutes)
routes.use('/auth', authRoutes)
routes.use('/team', ensureAuthenticated, teamRoutes)

export default routes

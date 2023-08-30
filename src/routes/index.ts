import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import ensureAuthenticated from 'middlewares/ensureAuthenticated'

const routes = Router()

routes.use('/user', ensureAuthenticated, userRoutes)
routes.use('/auth', authRoutes)

export default routes

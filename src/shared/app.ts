import 'reflect-metadata'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'

import './database/typeorm'
import './container'
import routes from 'routes/'
import initializeDatabaseConnection from 'shared/middlewares/initializeDatabaseConnection'
import handleErrors from 'shared/middlewares/handleErrors'

const app = express()

app.use(cors({}))
app.use(express.json())

app.use(initializeDatabaseConnection)
app.use(routes)

app.use(handleErrors)

export default app

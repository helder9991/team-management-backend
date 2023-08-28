import 'dotenv/config'
import path from 'path'
import { DataSource, type DataSourceOptions } from 'typeorm'

const isTestEnv = process.env.NODE_ENV === 'test'

const databaseConfig = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: [
    path.resolve(
      __dirname,
      '..',
      '..',
      'modules',
      '**',
      'entities',
      '*.{js,ts}',
    ),
  ],
  migrations: [path.resolve(__dirname, 'migrations', '*.{js,ts}')],
  migrationsTableName: 'migrations',
  synchronize: false,
}

let connectionOptions

if (isTestEnv) {
  connectionOptions = {
    type: 'sqlite',
    database: path.join(path.resolve(__dirname, '..'), 'db.sqlite'),
    ...databaseConfig,
  }
} else {
  connectionOptions = {
    type: 'postgres',
    database: process.env.DB_DATABASE,
    ...databaseConfig,
  }
}

const typeORMConnection = new DataSource(connectionOptions as DataSourceOptions)

export default typeORMConnection

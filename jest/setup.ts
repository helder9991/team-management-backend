import typeORMConnection from '../src/database/typeorm'
import MainSeedController from '../src/database/typeorm/seeds'

export default async (): Promise<void> => {
  try {
    await typeORMConnection.initialize()
    await typeORMConnection.runMigrations()
    console.log('Migrations finished.')
    
    await MainSeedController.run({})

    await typeORMConnection.destroy()
  } catch (err) {
    console.error(err)
  }
}

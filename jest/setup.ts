import typeORMConnection from '../src/shared/database/typeorm'
import MainSeedController from '../src/shared/database/typeorm/seeds'

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

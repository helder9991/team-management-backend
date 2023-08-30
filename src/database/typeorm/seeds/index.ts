import typeORMConnection from '..'
import UsersRolesSeed from './UsersRolesSeed'
import UsersSeed from './UsersSeed'

class MainSeedController {
  async run(): Promise<void> {
    try {
      console.log('Initializate Seed Controller!')
      if (!typeORMConnection.isInitialized) await typeORMConnection.initialize()
      await UsersRolesSeed.run()
      await UsersSeed.run()

      console.log('Seed Controller finished!')
    } catch (err) {
      console.error(err)
    }
  }
}

if (process.env.RUN_SEED === 'true') {
  new MainSeedController().run()
}

export default new MainSeedController()

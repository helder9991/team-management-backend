import typeORMConnection from '..'
import TasksPrioritySeed from './TasksPrioritySeed'
import TasksStatusSeed from './TasksStatusSeed'
import UsersRolesSeed from './UsersRolesSeed'
import UsersSeed from './UsersSeed'

interface MainSeedParams {
  silent?: boolean
}
class MainSeedController {
  async run({ silent = false }: MainSeedParams): Promise<void> {
    try {
      if (!silent) console.log('Initializate Seed Controller!')

      if (!typeORMConnection.isInitialized) await typeORMConnection.initialize()

      await UsersRolesSeed.run(silent)
      await UsersSeed.run(silent)
      await TasksStatusSeed.run(silent)
      await TasksPrioritySeed.run(silent)

      if (!silent) console.log('Seed Controller finished!')
    } catch (err) {
      if (!silent) console.error(err)
    }
  }
}

if (process.env.RUN_SEED === 'true') {
  new MainSeedController().run({ silent: false })
}

export default new MainSeedController()

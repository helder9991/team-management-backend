import typeORMConnection from '../src/database/typeorm'

export default async (): Promise<void> => {
  try {
    await typeORMConnection.initialize()
    await typeORMConnection.runMigrations()
    console.log('Migrations realizadas.')
    await typeORMConnection.destroy()
  } catch (err) {
    console.error(err)
  }
}

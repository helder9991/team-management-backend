import 'reflect-metadata'
import MainSeedController from 'shared/database/typeorm/seeds'
import ListTasksPriorityUseCase from './ListTasksPriorityUseCase'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import clearTablesInTest from 'shared/utils/clearTablesInTest'
import TaskPriorityRepository from 'modules/tasks/repository/typeorm/TaskPriorityRepository'
import { insertTasksPriorityName } from 'shared/database/typeorm/seeds/TasksPrioritySeed'

let listTasksPriority: ListTasksPriorityUseCase

let taskPriorityRepository: TaskPriorityRepository
let fakeCacheProvider: FakeCacheProvider

describe('List Tasks Priority', () => {
  beforeAll(async () => {
    try {
      await clearTablesInTest({})

      taskPriorityRepository = new TaskPriorityRepository()
      fakeCacheProvider = new FakeCacheProvider()

      listTasksPriority = new ListTasksPriorityUseCase(
        taskPriorityRepository,
        fakeCacheProvider,
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks priority', async () => {
    const tasksPriority = await listTasksPriority.execute()

    expect(tasksPriority).toHaveLength(insertTasksPriorityName.length)
    expect(tasksPriority.map(({ name }) => name)).toEqual(
      insertTasksPriorityName,
    )
  })

  it('Should be able to list all tasks priority by cache', async () => {
    await listTasksPriority.execute()
    await clearTablesInTest({ tasksPriority: true })

    const tasksPriority = await listTasksPriority.execute()

    expect(tasksPriority).toHaveLength(insertTasksPriorityName.length)
    expect(tasksPriority.map(({ name }) => name)).toEqual(
      insertTasksPriorityName,
    )

    await MainSeedController.run({ silent: true })
  })
})

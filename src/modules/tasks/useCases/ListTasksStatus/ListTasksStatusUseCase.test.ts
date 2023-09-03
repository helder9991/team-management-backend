import 'reflect-metadata'
import ListTasksStatusUseCase from './ListTasksStatusUseCase'
import TaskStatusRepository from 'modules/tasks/repository/typeorm/TaskStatusRepository'
import FakeCacheProvider from 'shared/container/providers/CacheProvider/fakes/FakeCacheProvider'
import { insertTasksStatusName } from 'shared/database/typeorm/seeds/TasksStatusSeed'
import clearTablesInTest from 'shared/utils/clearTablesInTest'

let listTasksStatus: ListTasksStatusUseCase

let taskStatusRepository: TaskStatusRepository
let fakeCacheProvider: FakeCacheProvider

describe('List Tasks Status', () => {
  beforeAll(async () => {
    try {
      await clearTablesInTest({})

      taskStatusRepository = new TaskStatusRepository()
      fakeCacheProvider = new FakeCacheProvider()

      listTasksStatus = new ListTasksStatusUseCase(
        taskStatusRepository,
        fakeCacheProvider,
      )
    } catch (err) {
      console.error(err)
    }
  })

  it('Should be able to list all tasks status', async () => {
    const tasksStatus = await listTasksStatus.execute()

    expect(tasksStatus).toHaveLength(insertTasksStatusName.length)
    expect(tasksStatus.map(({ name }) => name)).toEqual(insertTasksStatusName)
  })

  it('Should be able to list all tasks status', async () => {
    await listTasksStatus.execute()
    const tasksStatus = await listTasksStatus.execute()

    expect(tasksStatus).toHaveLength(insertTasksStatusName.length)
    expect(tasksStatus.map(({ name }) => name)).toEqual(insertTasksStatusName)
  })
})

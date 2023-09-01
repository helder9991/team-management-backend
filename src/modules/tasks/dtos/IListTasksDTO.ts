import { type FindOptionsWhere } from 'typeorm'
import type Task from '../entities/Task'

interface IListTasksDTO {
  page: number
  where?: FindOptionsWhere<Task>
}

export default IListTasksDTO

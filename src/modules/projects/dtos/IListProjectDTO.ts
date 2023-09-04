import { type FindOptionsWhere } from 'typeorm'
import type Project from '../entities/Project'

interface IListProjectsDTO {
  page?: number
  where?: FindOptionsWhere<Project>
}

export default IListProjectsDTO

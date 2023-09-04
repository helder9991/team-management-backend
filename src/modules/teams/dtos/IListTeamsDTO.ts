import { type FindOptionsWhere } from 'typeorm'
import type Team from '../entities/Team'

interface IListTeamsDTO {
  page?: number
  where?: FindOptionsWhere<Team>
}

export default IListTeamsDTO

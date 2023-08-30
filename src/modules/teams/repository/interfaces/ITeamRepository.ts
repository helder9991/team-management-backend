import type ICreateTeamDTO from 'modules/teams/dtos/ICreateTeamDTO'
import type IListTeamsDTO from 'modules/teams/dtos/IListTeamsDTO'
import type Team from 'modules/teams/entities/Team'
import { type ISavedItemCount } from 'shared/interfaces/database'

interface ITeamRepository {
  create: (data: ICreateTeamDTO) => Promise<Team>
  list: (data: IListTeamsDTO) => Promise<[Team[], ISavedItemCount]>
  findById: (id: string) => Promise<Team | null>
  delete: (id: string) => Promise<boolean>
}

export default ITeamRepository

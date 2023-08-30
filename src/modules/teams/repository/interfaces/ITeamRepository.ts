import type ICreateTeamDTO from 'modules/teams/dtos/ICreateTeamDTO'
import type IListTeamsDTO from 'modules/teams/dtos/IListTeamsDTO'
import type Team from 'modules/teams/entities/Team'

export type SavedItemCount = number

interface ITeamRepository {
  create: (data: ICreateTeamDTO) => Promise<Team>
  list: (data: IListTeamsDTO) => Promise<[Team[], SavedItemCount]>
}

export default ITeamRepository

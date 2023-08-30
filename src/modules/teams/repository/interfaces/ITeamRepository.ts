import type ICreateTeamDTO from 'modules/teams/dtos/ICreateTeamDTO'
import type Team from 'modules/teams/entities/Team'

export type SavedItemCount = number

interface ITeamRepository {
  create: (data: ICreateTeamDTO) => Promise<Team>
}

export default ITeamRepository

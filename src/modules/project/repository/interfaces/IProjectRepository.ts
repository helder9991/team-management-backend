import type ICreateProjectDTO from 'modules/project/dtos/ICreateProjectDTO'
import type Project from 'modules/project/entities/Project'

interface IProjectRepository {
  create: (data: ICreateProjectDTO) => Promise<Project>
  findByName: (name: string) => Promise<Project | null>
}

export default IProjectRepository

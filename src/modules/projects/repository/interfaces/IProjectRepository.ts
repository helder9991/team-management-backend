import type ICreateProjectDTO from 'modules/projects/dtos/ICreateProjectDTO'
import type IListProjectsDTO from 'modules/projects/dtos/IListProjectDTO'
import type IUpdateProjectDTO from 'modules/projects/dtos/IUpdateProjectDTO'
import type Project from 'modules/projects/entities/Project'
import { type ISavedItemCount } from 'shared/interfaces/database'

interface IProjectRepository {
  create: (data: ICreateProjectDTO) => Promise<Project>
  findByName: (name: string) => Promise<Project | null>
  findById: (id: string) => Promise<Project | null>
  list: (data: IListProjectsDTO) => Promise<[Project[], ISavedItemCount]>
  update: (data: IUpdateProjectDTO) => Promise<Project>
  delete: (id: string) => Promise<boolean>
}

export default IProjectRepository

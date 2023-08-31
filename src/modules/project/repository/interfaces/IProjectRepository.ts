import type ICreateProjectDTO from 'modules/project/dtos/ICreateProjectDTO'
import type IListProjectsDTO from 'modules/project/dtos/IListProjectDTO'
import type IUpdateProjectDTO from 'modules/project/dtos/IUpdateProjectDTO'
import type Project from 'modules/project/entities/Project'
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

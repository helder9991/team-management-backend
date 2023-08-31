import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import { type ISavedItemCount } from 'shared/interfaces/database'
import IProjectRepository from 'modules/project/repository/interfaces/IProjectRepository'
import type Project from 'modules/project/entities/Project'

interface IListProjectsParams {
  page?: number
}

@injectable()
class ListProjectsUseCase {
  constructor(
    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({
    page = 1,
  }: IListProjectsParams): Promise<[Project[], ISavedItemCount]> {
    const projectsListCached = await this.cacheProvider.recover<
      [Project[], ISavedItemCount]
    >(`projects-list:${page}`)

    let projects, savedItemCount

    if (projectsListCached !== null) {
      ;[projects, savedItemCount] = projectsListCached
    } else {
      ;[projects, savedItemCount] = await this.projectRepository.list({
        page,
      })

      await this.cacheProvider.save(`projects-list:${page}`, [
        projects,
        savedItemCount,
      ])
    }
    return [projects, savedItemCount]
  }
}

export default ListProjectsUseCase

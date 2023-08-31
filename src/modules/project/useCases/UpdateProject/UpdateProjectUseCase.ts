import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import type Project from 'modules/project/entities/Project'
import IProjectRepository from 'modules/project/repository/interfaces/IProjectRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IUpdateProjectParams = Partial<
  Omit<Project, 'createdAt' | 'deletedAt'>
> & {
  id: string
}

@injectable()
class UpdateProjectUseCase {
  constructor(
    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({ id, name, teamId }: IUpdateProjectParams): Promise<Project> {
    const projectExists = await this.projectRepository.findById(id)

    if (projectExists === null)
      throw new AppError('Project doesn`t exist.', 400)

    const project = await this.projectRepository.update({
      id,
      name,
      teamId,
    })

    await this.cacheProvider.invalidatePrefix('projects-list')

    return project
  }
}

export default UpdateProjectUseCase

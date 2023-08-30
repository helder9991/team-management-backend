import ICacheProviders from 'container/providers/CacheProvider/models/ICacheProvider'
import { inject, injectable } from 'tsyringe'
import type Project from 'modules/project/entities/Project'
import IProjectRepository from 'modules/project/repository/interfaces/IProjectRepository'
import AppError from 'utils/AppError'

type ICreateProjectParams = Pick<Project, 'name' | 'teamId'>

@injectable()
class CreateProjectUseCase {
  constructor(
    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProviders,
  ) {}

  async execute({ name, teamId }: ICreateProjectParams): Promise<Project> {
    const projectExists = await this.projectRepository.findByName(name)

    if (projectExists !== null)
      throw new AppError('Project already exists.', 400)

    const project = await this.projectRepository.create({
      name,
      teamId,
    })

    await this.cacheProvider.invalidatePrefix('projects-list')

    return project
  }
}

export default CreateProjectUseCase

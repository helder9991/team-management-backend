import ICacheProvider from 'container/providers/CacheProvider/models/ICacheProvider'
import type Project from 'modules/project/entities/Project'
import IProjectRepository from 'modules/project/repository/interfaces/IProjectRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'utils/AppError'

type IDeleteUserParams = Pick<Project, 'id'>

@injectable()
class DeleteProjectUseCase {
  constructor(
    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute({ id }: IDeleteUserParams): Promise<void> {
    const projectDeleted = await this.projectRepository.delete(id)

    if (!projectDeleted) throw new AppError('Project doesn`t exist.')

    await this.cacheProvider.invalidatePrefix('projects-list')
  }
}

export default DeleteProjectUseCase

import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import { type ParsedQs } from 'qs'
import * as Yup from 'yup'
import AppError from 'utils/AppError'
import type Project from 'modules/project/entities/Project'
import ListProjectsUseCase from 'modules/project/useCases/ListProjects/ListProjectsUseCase'

export interface IListProjectsControllerResponse {
  projects: Project[]
  savedItemCount: number
}

interface IQueryRequest extends ParsedQs {
  page?: string
}

class ListProjectsController {
  private readonly schema

  constructor() {
    this.schema = Yup.object().shape({
      page: Yup.number().positive(),
    })
  }

  async handle(req: Request, res: Response): Promise<Response> {
    const { page = 1 } = req.query as IQueryRequest

    if (!(await this.schema.isValid({ page })))
      throw new AppError('Validation Fails.', 400)

    const listProjectsUseCase: ListProjectsUseCase =
      container.resolve(ListProjectsUseCase)

    const [projects, savedItemCount] = await listProjectsUseCase.execute({
      page: Number(page),
    })

    return res.status(200).json({ projects, savedItemCount })
  }
}

export default new ListProjectsController()

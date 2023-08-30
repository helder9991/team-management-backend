import { type Request, type Response } from 'express'
import { container } from 'tsyringe'
import { type ParsedQs } from 'qs'
import * as Yup from 'yup'
import AppError from 'utils/AppError'
import type Team from 'modules/teams/entities/Team'
import ListTeamsUseCase from 'modules/teams/useCases/ListTeams/ListTeamsUseCase'

export interface IListTeamsControllerResponse {
  teams: Team[]
  savedItemCount: number
}

interface IQueryRequest extends ParsedQs {
  page?: string
}

class ListTeamsController {
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

    const listTeamsUseCase: ListTeamsUseCase =
      container.resolve(ListTeamsUseCase)

    const [teams, savedItemCount] = await listTeamsUseCase.execute({
      page: Number(page),
    })

    return res.status(200).json({ teams, savedItemCount })
  }
}

export default new ListTeamsController()

import ICacheProvider from 'shared/container/providers/CacheProvider/interfaces/ICacheProvider'
import IProjectRepository from 'modules/projects/repository/interfaces/IProjectRepository'
import type Task from 'modules/tasks/entities/Task'
import { completedTaskStatus } from 'modules/tasks/entities/TaskStatus'
import ITaskRepository from 'modules/tasks/repository/interfaces/ITaskRepository'
import ITaskStatusRepository from 'modules/tasks/repository/interfaces/ITaskStatusRepository'
import { inject, injectable } from 'tsyringe'
import AppError from 'shared/utils/AppError'
import IMailQueueProvider from 'shared/container/providers/MailQueueProvider/interfaces/IMailQueueProvider'
import IUserRepository from 'modules/users/repository/interfaces/IUserRepository'
import { type IMailContact } from 'shared/container/providers/MailProvider/dtos/ISendMailDTO'

type ICreateTaskParams = Pick<Task, 'id'> & {
  userTeamId: string
}

@injectable()
class CompleteTaskUseCase {
  constructor(
    @inject('TaskRepository')
    private readonly taskRepository: ITaskRepository,

    @inject('TaskStatusRepository')
    private readonly taskStatusRepository: ITaskStatusRepository,

    @inject('ProjectRepository')
    private readonly projectRepository: IProjectRepository,

    @inject('UserRepository')
    private readonly userRepository: IUserRepository,

    @inject('CacheProvider')
    private readonly cacheProvider: ICacheProvider,

    @inject('MailQueueProvider')
    private readonly mailQueueProvider: IMailQueueProvider,
  ) {}

  async execute({ id, userTeamId }: ICreateTaskParams): Promise<Task> {
    const taskStatusExists =
      await this.taskStatusRepository.findByName(completedTaskStatus)

    if (taskStatusExists === null)
      throw new AppError('Task Status doesn`t exists.', 400)

    const taskExists = await this.taskRepository.findById(id)

    if (taskExists === null) throw new AppError('Task doesn`t exists.', 400)

    const projectExists = await this.projectRepository.findById(
      taskExists.projectId,
    )

    if (projectExists?.teamId !== userTeamId)
      throw new AppError('This user doesn`t belongs to this project.')

    if (taskExists.taskStatusId === taskStatusExists.id)
      throw new AppError('This tasks was already completed.')

    const task = await this.taskRepository.update({
      ...taskExists,
      taskStatusId: taskStatusExists.id,
    })

    await this.cacheProvider.invalidatePrefix('tasks-list')

    const [users] = await this.userRepository.list({
      where: { teamId: userTeamId },
    })

    const usersEmail: IMailContact[] = users.map(({ name, email }) => ({
      name,
      email,
    }))

    this.mailQueueProvider.addToQueue({
      from: {
        name: 'Admin',
        email: 'admin@mail.com',
      },
      to: usersEmail,
      subject: `Task completed: ${task.name}`,
      text: `The task ${task.name} was completed.`,
    })

    return task
  }
}

export default CompleteTaskUseCase

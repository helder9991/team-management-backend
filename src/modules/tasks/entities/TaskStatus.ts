import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import Task from './Task'

export type ITaskStatusName =
  | 'Pronta para Iniciar'
  | 'Em Andamento'
  | 'Finalizada'

export const readyTaskStatus = 'Pronta para Iniciar'
export const inProgressTaskStatus = 'Em Andamento'
export const completedTaskStatus = 'Finalizada'

@Entity('tasks_status')
class TaskStatus {
  @PrimaryColumn({ name: 'task_status_id', type: 'uuid' })
  id: string

  @Column({ name: 'task_status_name' })
  name: string

  @OneToMany(() => Task, (task) => task.taskStatus)
  tasks: Task[]

  @CreateDateColumn({ name: 'task_status_created_at', select: false })
  createdAt?: Date

  @DeleteDateColumn({
    name: 'task_status_deleted_at',
    nullable: true,
    select: false,
  })
  deletedAt?: Date
}

export default TaskStatus

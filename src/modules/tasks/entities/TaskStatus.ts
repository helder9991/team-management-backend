import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm'

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

  @CreateDateColumn({ name: 'task_status_created_at' })
  createdAt?: Date

  @DeleteDateColumn({ name: 'task_status_deleted_at', nullable: true })
  deletedAt?: Date
}

export default TaskStatus

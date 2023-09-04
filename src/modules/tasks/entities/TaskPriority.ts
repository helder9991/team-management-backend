import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import Task from './Task'

export type ITaskPriorityName =
  | 'Baixa Prioridade'
  | 'Prioridade Normal'
  | 'Alta Prioridade'

export const lowTaskPriority = 'Baixa Prioridade'
export const normalTaskPriority = 'Prioridade Normal'
export const highTaskPriority = 'Alta Prioridade'

@Entity('tasks_priority')
class TaskPriority {
  @PrimaryColumn({ name: 'task_priority_id', type: 'uuid' })
  id: string

  @Column({ name: 'task_priority_name' })
  name: string

  @OneToMany(() => Task, (task) => task.taskStatus)
  tasks: Task[]

  @CreateDateColumn({ name: 'task_priority_created_at', select: false })
  createdAt?: Date

  @DeleteDateColumn({
    name: 'task_priority_deleted_at',
    nullable: true,
    select: false,
  })
  deletedAt?: Date
}

export default TaskPriority

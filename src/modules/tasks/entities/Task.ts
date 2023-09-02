import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import TaskStatus from './TaskStatus'
import TaskPriority from './TaskPriority'

@Entity('tasks')
class Task {
  @PrimaryColumn({ name: 'task_id', type: 'uuid' })
  id: string

  @Column({ name: 'task_name' })
  name: string

  @Column({ name: 'task_description' })
  description: string

  @Column({ name: 'task_status_id' })
  taskStatusId: string

  @Column({ name: 'task_priority_id' })
  taskPriorityId: string

  @Column({ name: 'project_id' })
  projectId: string

  @Column({ name: 'user_id' })
  userId: string

  @ManyToOne(() => TaskStatus, (taskStatus) => taskStatus.tasks)
  @JoinColumn({ name: 'task_status_id' })
  taskStatus: TaskStatus

  @ManyToOne(() => TaskPriority, (taskPriority) => taskPriority.tasks)
  @JoinColumn({ name: 'task_priority_id' })
  taskPriority: TaskPriority

  @CreateDateColumn({ name: 'task_created_at' })
  createdAt?: Date

  @DeleteDateColumn({ name: 'task_deleted_at', nullable: true })
  deletedAt?: Date
}

export default Task

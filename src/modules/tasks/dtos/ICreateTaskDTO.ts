interface ICreateTaskDTO {
  name: string
  description?: string
  projectId: string
  taskStatusId: string
  taskPriorityId: string
  userId: string
}

export default ICreateTaskDTO

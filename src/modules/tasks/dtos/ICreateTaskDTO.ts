interface ICreateTaskDTO {
  name: string
  description?: string
  projectId: string
  taskStatusId: string
  taskPriorityId: string
}

export default ICreateTaskDTO

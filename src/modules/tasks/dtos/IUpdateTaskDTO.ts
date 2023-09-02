interface IUpdateTaskDTO {
  id: string
  name: string
  description?: string
  taskStatusId: string
  taskPriorityId: string
  userId?: string
}

export default IUpdateTaskDTO

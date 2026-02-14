export type ProjectStatus = "not-started" | "in-progress" | "completed"

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  fromDate: string
  toDate: string
  assignedEmail: string
  createdAt: string
}

export interface User {
  email: string
  name: string
}

export type ProjectStatus = "not-started" | "in-progress" | "completed" | "pending" | "approved" | "rejected"

export interface TeamMember {
  id: number
  name: string
  employeeId: string
  projectId: number
  createdAt: string
}

export interface SrsDocument {
  id: number
  name: string
  fileName: string
  filePath: string
  status: "pending" | "approved" | "rejected"
  comments?: string
  projectId: number
  uploadDate: string
  updatedAt: string
}

export interface ProjectReview {
  id: number
  reviewType: string
  reviewDate: string
  meetLink?: string
  marks?: string
  comments?: string
  result?: string // Pass / Rework
  status: "scheduled" | "completed" | "delayed"
  projectId: number
  createdAt: string
  updatedAt: string
}

export interface ProjectDocument {
  id: number
  templateName: string
  fileName: string
  filePath: string
  projectId: number
  uploadDate: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  fromDate: string
  toDate: string
  assignedName?: string | null
  assignedId?: string | null
  assignedEmail?: string | null
  teamMembers?: TeamMember[]
  srsDocuments?: SrsDocument[]
  reviews?: ProjectReview[]
  documents?: ProjectDocument[]
  createdAt: string
  logs?: DailyLog[]
  userId?: number
  technologies?: string
  guideName?: string
  maxStudents?: number
}

export interface DailyLog {
  id: number
  content: string
  date: string
  projectId: number
  userId: number
  user?: User
  teamMemberId?: number
  teamMember?: TeamMember
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: string
}

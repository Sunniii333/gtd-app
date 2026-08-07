export type TaskStatus = 'inbox' | 'next' | 'waiting' | 'someday' | 'completed'

export interface Task {
  id: string
  title: string
  notes?: string
  status: TaskStatus
  contexts: string[]
  projectId?: string
  waitingOn?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export type ProjectStatus = 'active' | 'someday' | 'completed'

export interface Project {
  id: string
  name: string
  notes?: string
  status: ProjectStatus
  createdAt: number
}

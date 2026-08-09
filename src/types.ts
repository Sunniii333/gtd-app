export type TaskStatus = 'inbox' | 'next' | 'waiting' | 'someday' | 'completed'

export interface Task {
  id: string
  title: string
  notes?: string
  status: TaskStatus
  contexts: string[]
  projectId?: string
  waitingOn?: string
  /** Local start-of-day epoch ms. Hidden from Next Actions until this day arrives. */
  deferUntil?: number
  /** Local start-of-day epoch ms. A real deadline — never auto-filled. */
  dueDate?: number
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

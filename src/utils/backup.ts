import type { Project, ProjectStatus, Task, TaskStatus } from '../types'

const TASK_STATUSES: TaskStatus[] = ['inbox', 'next', 'waiting', 'someday', 'completed']
const PROJECT_STATUSES: ProjectStatus[] = ['active', 'someday', 'completed']

export interface BackupFile {
  version: 1
  exportedAt: number
  tasks: Task[]
  projects: Project[]
  lastReviewAt?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOptionalNumber(value: unknown): boolean {
  return value === undefined || typeof value === 'number'
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    TASK_STATUSES.includes(value.status as TaskStatus) &&
    Array.isArray(value.contexts) &&
    value.contexts.every((c) => typeof c === 'string') &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    isOptionalNumber(value.deferUntil) &&
    isOptionalNumber(value.dueDate)
  )
}

function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    PROJECT_STATUSES.includes(value.status as ProjectStatus) &&
    typeof value.createdAt === 'number'
  )
}

/**
 * Parses and validates a backup file. Throws with a readable message rather than
 * letting a malformed file overwrite the store with garbage.
 */
export function parseBackup(text: string): BackupFile {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (!isRecord(raw)) throw new Error('That file is not a GTD backup.')
  if (!Array.isArray(raw.tasks) || !Array.isArray(raw.projects)) {
    throw new Error('That file is missing its tasks or projects.')
  }
  if (!raw.tasks.every(isTask)) throw new Error('Some tasks in that file are malformed.')
  if (!raw.projects.every(isProject)) {
    throw new Error('Some projects in that file are malformed.')
  }

  return {
    version: 1,
    exportedAt: typeof raw.exportedAt === 'number' ? raw.exportedAt : Date.now(),
    tasks: raw.tasks,
    projects: raw.projects,
    lastReviewAt: typeof raw.lastReviewAt === 'number' ? raw.lastReviewAt : undefined,
  }
}

export function downloadBackup(backup: BackupFile) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gtd-backup-${new Date(backup.exportedAt).toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

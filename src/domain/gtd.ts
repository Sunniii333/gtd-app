import type { GtdData, Item, ItemStatus, Project, ProjectStatus } from '../types'

/** Statuses that keep a project moving: something is actually in motion for it. */
const OPEN: ReadonlySet<ItemStatus> = new Set(['next', 'calendar', 'waiting'])

export const isOpen = (item: Item) => OPEN.has(item.status)

/** The context lists suggested in the book. Any other context can still be typed in. */
export const SUGGESTED_CONTEXTS = [
  '@calls',
  '@computer',
  '@errands',
  '@office',
  '@home',
  '@anywhere',
  '@agendas',
  '@read-review',
]

export function normalizeContext(raw: string): string | undefined {
  const trimmed = raw.trim().toLowerCase().replace(/\s+/g, '-')
  if (!trimmed || trimmed === '@') return undefined
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}

export function openItemsForProject(data: GtdData, projectId: string): Item[] {
  return data.items.filter((i) => i.projectId === projectId && isOpen(i))
}

/**
 * Active projects with nothing in motion. The book's rule: every project needs at
 * least one next action, calendar entry or waiting-for — otherwise it has stalled.
 */
export function stalledProjects(data: GtdData): Project[] {
  const moving = new Set(data.items.filter(isOpen).map((i) => i.projectId))
  return data.projects.filter((p) => p.status === 'active' && !moving.has(p.id))
}

/** Next actions worth showing: those of projects parked in Someday/Maybe wait with it. */
export function visibleNextActions(data: GtdData): Item[] {
  const parked = new Set(data.projects.filter((p) => p.status !== 'active').map((p) => p.id))
  return data.items.filter(
    (i) => i.status === 'next' && (i.projectId === undefined || !parked.has(i.projectId)),
  )
}

function activeProjectId(data: GtdData, projectId?: string): string | undefined {
  if (!projectId) return undefined
  return data.projects.some((p) => p.id === projectId && p.status === 'active')
    ? projectId
    : undefined
}

export interface ChangeResult {
  data: GtdData
  /** Set when the change leaves a project needing an answer to "what's next?". */
  followUpProjectId?: string
}

/** Completing any open item of an active project always asks what comes next. */
export function completeItem(data: GtdData, id: string, now: number): ChangeResult {
  const target = data.items.find((i) => i.id === id)
  if (!target) return { data }
  const items = data.items.map((i) =>
    i.id === id ? { ...i, status: 'done' as const, completedAt: now, updatedAt: now } : i,
  )
  return {
    data: { ...data, items },
    followUpProjectId: isOpen(target) ? activeProjectId(data, target.projectId) : undefined,
  }
}

/** Deleting asks only when it leaves the project with nothing in motion. */
export function deleteItem(data: GtdData, id: string): ChangeResult {
  const target = data.items.find((i) => i.id === id)
  if (!target) return { data }
  const next = { ...data, items: data.items.filter((i) => i.id !== id) }
  const projectId = activeProjectId(data, target.projectId)
  const leftStalled =
    projectId !== undefined && isOpen(target) && openItemsForProject(next, projectId).length === 0
  return { data: next, followUpProjectId: leftStalled ? projectId : undefined }
}

/** A finished project closes whatever was still open for it, so nothing orphaned lingers. */
export function completeProject(data: GtdData, id: string, now: number): GtdData {
  return {
    ...data,
    projects: data.projects.map((p) =>
      p.id === id ? { ...p, status: 'done' as const, completedAt: now } : p,
    ),
    items: data.items.map((i) =>
      i.projectId === id && isOpen(i)
        ? { ...i, status: 'done' as const, completedAt: now, updatedAt: now }
        : i,
    ),
  }
}

/**
 * The book's tickler: on its day, an incubated item goes back into the in-basket to be
 * clarified again. Returns the same array when nothing is due.
 */
export function releaseTickler(items: Item[], today: number): { items: Item[]; released: number } {
  let released = 0
  const out = items.map((i) => {
    if (i.status !== 'someday' || i.ticklerDate === undefined || i.ticklerDate > today) return i
    released++
    return { ...i, status: 'inbox' as const, ticklerDate: undefined, updatedAt: Date.now() }
  })
  return released ? { items: out, released } : { items, released }
}

// ---------------------------------------------------------------------------
// Migration from the first version (tasks with dueDate / deferUntil / contexts[])

interface V1Task {
  id: string
  title: string
  notes?: string
  status: 'inbox' | 'next' | 'waiting' | 'someday' | 'completed'
  contexts?: string[]
  projectId?: string
  waitingOn?: string
  deferUntil?: number
  dueDate?: number
  createdAt: number
  updatedAt: number
  completedAt?: number
}

interface V1Project {
  id: string
  name: string
  notes?: string
  status: 'active' | 'someday' | 'completed'
  createdAt: number
}

function migrateTask(t: V1Task, today: number): Item {
  const item: Item = {
    id: t.id,
    title: t.title,
    notes: t.notes,
    status: t.status === 'completed' ? 'done' : t.status,
    context: t.contexts?.[0] ? normalizeContext(t.contexts[0]) : undefined,
    projectId: t.projectId,
    waitingOn: t.waitingOn,
    waitingSince: t.status === 'waiting' ? t.updatedAt : undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    completedAt: t.completedAt,
  }
  if (t.status === 'next' && t.dueDate !== undefined) {
    // A real deadline belongs on the calendar, the book's hard landscape.
    return { ...item, status: 'calendar', date: t.dueDate }
  }
  if (t.status === 'next' && t.deferUntil !== undefined && t.deferUntil > today) {
    // "Hide until" is the tickler: it comes back to the Inbox on its day.
    return { ...item, status: 'someday', ticklerDate: t.deferUntil }
  }
  return item
}

const V1_PROJECT_STATUS: Record<V1Project['status'], ProjectStatus> = {
  active: 'active',
  someday: 'someday',
  completed: 'done',
}

export function migrateV1(
  old: { tasks: V1Task[]; projects: V1Project[]; lastReviewAt?: number },
  today: number,
): GtdData {
  return {
    items: old.tasks.map((t) => migrateTask(t, today)),
    projects: old.projects.map((p) => ({
      id: p.id,
      name: p.name,
      outcome: p.notes,
      status: V1_PROJECT_STATUS[p.status] ?? 'active',
      createdAt: p.createdAt,
    })),
    lastReviewAt: old.lastReviewAt,
  }
}

// ---------------------------------------------------------------------------
// Backup files

const ITEM_STATUSES: ItemStatus[] = ['inbox', 'next', 'calendar', 'waiting', 'someday', 'reference', 'done']
const PROJECT_STATUSES: ProjectStatus[] = ['active', 'someday', 'done']

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const optNumber = (v: unknown) => v === undefined || typeof v === 'number'
const optString = (v: unknown) => v === undefined || typeof v === 'string'

function isItem(v: unknown): v is Item {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    ITEM_STATUSES.includes(v.status as ItemStatus) &&
    optString(v.context) &&
    optString(v.projectId) &&
    optNumber(v.date) &&
    optNumber(v.ticklerDate) &&
    typeof v.createdAt === 'number' &&
    typeof v.updatedAt === 'number'
  )
}

function isProject(v: unknown): v is Project {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    PROJECT_STATUSES.includes(v.status as ProjectStatus) &&
    typeof v.createdAt === 'number'
  )
}

function isV1Task(v: unknown): v is V1Task {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    ['inbox', 'next', 'waiting', 'someday', 'completed'].includes(v.status as string) &&
    typeof v.createdAt === 'number' &&
    typeof v.updatedAt === 'number'
  )
}

function isV1Project(v: unknown): v is V1Project {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    ['active', 'someday', 'completed'].includes(v.status as string) &&
    typeof v.createdAt === 'number'
  )
}

/** Reads a backup from either version. Throws a readable message instead of importing garbage. */
export function parseBackup(text: string, today: number): GtdData {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!isRecord(raw) || !Array.isArray(raw.projects)) throw new Error('That file is not a GTD backup.')
  const lastReviewAt = typeof raw.lastReviewAt === 'number' ? raw.lastReviewAt : undefined

  if (Array.isArray(raw.tasks)) {
    if (!raw.tasks.every(isV1Task) || !raw.projects.every(isV1Project)) {
      throw new Error('Some entries in that file are malformed.')
    }
    return migrateV1({ tasks: raw.tasks, projects: raw.projects, lastReviewAt }, today)
  }
  if (!Array.isArray(raw.items) || !raw.items.every(isItem) || !raw.projects.every(isProject)) {
    throw new Error('Some entries in that file are malformed.')
  }
  return { items: raw.items, projects: raw.projects, lastReviewAt }
}

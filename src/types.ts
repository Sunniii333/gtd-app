/**
 * Where an item lives, one status per list in the book:
 * - inbox: captured, not yet clarified
 * - next: Next Actions list, filed under one context
 * - calendar: must happen on a specific day (the "hard landscape")
 * - waiting: delegated or blocked on someone else
 * - someday: incubated; may carry a tickler date that sends it back to the Inbox
 * - reference: not actionable, kept for information
 * - done: completed
 */
export type ItemStatus = 'inbox' | 'next' | 'calendar' | 'waiting' | 'someday' | 'reference' | 'done'

export interface Item {
  id: string
  title: string
  notes?: string
  status: ItemStatus
  /** The one context list this action lives on, e.g. "@calls". Next actions only. */
  context?: string
  projectId?: string
  /** Local start-of-day epoch ms. Calendar items only. */
  date?: number
  /** Optional time of day ("14:30") for time-specific calendar items. */
  time?: string
  waitingOn?: string
  /** Epoch ms when it was handed off, so the Waiting For list can show how long it has sat. */
  waitingSince?: number
  /** Local start-of-day epoch ms. Someday items only: returns to the Inbox on this day. */
  ticklerDate?: number
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export type ProjectStatus = 'active' | 'someday' | 'done'

export interface Project {
  id: string
  name: string
  /** The desired outcome: what "done" looks like. */
  outcome?: string
  status: ProjectStatus
  createdAt: number
  completedAt?: number
}

export interface GtdData {
  items: Item[]
  projects: Project[]
  lastReviewAt?: number
}

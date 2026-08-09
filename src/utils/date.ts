const DAY_MS = 24 * 60 * 60 * 1000

/** Local start-of-day epoch ms. All stored dates use this form. */
export function startOfDay(value: number | Date = Date.now()): number {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/**
 * Parses the "YYYY-MM-DD" value of an <input type="date">.
 * Built from local parts on purpose — `new Date('2026-08-14')` is parsed as UTC
 * midnight, which lands on the previous day in negative-offset timezones.
 */
export function fromDateInput(value: string): number | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day).getTime()
}

/** Formats an epoch back into the "YYYY-MM-DD" an <input type="date"> expects. */
export function toDateInput(epoch: number): string {
  const date = new Date(epoch)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function daysBetween(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS)
}

export type DueTone = 'overdue' | 'today' | 'upcoming'

export function dueTone(dueDate: number, today = startOfDay()): DueTone {
  if (dueDate < today) return 'overdue'
  if (dueDate === today) return 'today'
  return 'upcoming'
}

export function formatDueDate(dueDate: number, today = startOfDay()): string {
  const days = daysBetween(today, dueDate)
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  if (days === -1) return '1 day overdue'
  if (days < 0) return `${-days} days overdue`
  return `due ${new Date(dueDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`
}

export function formatDeferDate(deferUntil: number): string {
  return `deferred to ${new Date(deferUntil).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`
}

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

export function addDays(epoch: number, days: number): number {
  const date = new Date(epoch)
  date.setDate(date.getDate() + days)
  return startOfDay(date)
}

/** "Today", "Tomorrow", "Yesterday", or "Mon 28 Sep". */
export function formatDay(epoch: number, today = startOfDay()): string {
  const diff = daysBetween(today, epoch)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return new Date(epoch).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** "today", "1 day", "5 days" — how long something has been sitting. */
export function formatAge(since: number, now = Date.now()): string {
  const days = daysBetween(since, now)
  if (days <= 0) return 'today'
  return days === 1 ? '1 day' : `${days} days`
}

export function formatLastReview(lastReviewAt?: number): string {
  if (lastReviewAt === undefined) return 'never reviewed'
  const days = daysBetween(lastReviewAt, Date.now())
  if (days <= 0) return 'reviewed today'
  if (days === 1) return 'reviewed yesterday'
  return `reviewed ${days} days ago`
}

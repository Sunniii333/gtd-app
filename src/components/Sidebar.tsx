import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { stalledProjects, visibleNextActions } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'
import { daysBetween, formatLastReview, startOfDay } from '../utils/date'
import { CaptureBar } from './CaptureBar'
import { DataControls } from './DataControls'

interface NavItem {
  to: string
  label: string
  count?: number
  /** Something here needs a decision — never let it go unnoticed. */
  alert?: number
}

function useNavItems(): { items: NavItem[]; reviewText: string; reviewDue: boolean } {
  const items = useGtdStore((s) => s.items)
  const projects = useGtdStore((s) => s.projects)
  const lastReviewAt = useGtdStore((s) => s.lastReviewAt)

  return useMemo(() => {
    const data = { items, projects }
    const today = startOfDay()
    const calendar = items.filter((i) => i.status === 'calendar' && i.date !== undefined)
    const count = (status: string) => items.filter((i) => i.status === status).length
    const reviewDue = lastReviewAt === undefined || daysBetween(lastReviewAt, Date.now()) >= 7
    return {
      reviewDue,
      reviewText: formatLastReview(lastReviewAt),
      items: [
        { to: '/', label: 'Inbox', alert: count('inbox') },
        {
          to: '/calendar',
          label: 'Calendar',
          count: calendar.filter((i) => i.date === today).length,
          alert: calendar.filter((i) => i.date! < today).length,
        },
        { to: '/next', label: 'Next Actions', count: visibleNextActions(data).length },
        { to: '/waiting', label: 'Waiting For', count: count('waiting') },
        {
          to: '/projects',
          label: 'Projects',
          count: projects.filter((p) => p.status === 'active').length,
          alert: stalledProjects(data).length,
        },
        { to: '/someday', label: 'Someday/Maybe', count: count('someday') },
        { to: '/reference', label: 'Reference', count: count('reference') },
      ],
    }
  }, [items, projects, lastReviewAt])
}

function Badges({ item }: { item: NavItem }) {
  return (
    <span className="flex items-center gap-1">
      {!!item.alert && (
        <span className="rounded bg-pale-red px-1.5 font-mono text-[11px] text-pale-red-ink">{item.alert}</span>
      )}
      {!!item.count && (
        <span className="rounded border border-hairline px-1.5 font-mono text-[11px] text-muted">{item.count}</span>
      )}
    </span>
  )
}

export function Sidebar() {
  const { items, reviewText, reviewDue } = useNavItems()
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between gap-2 border-l-2 px-4 py-2 text-sm transition-colors ${
      isActive ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'
    }`

  return (
    <nav className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-hairline bg-surface py-8 md:block">
      <h1 className="mb-6 px-4 font-serif text-2xl italic tracking-tight text-ink">GTD</h1>
      <div className="mb-6 px-4">
        <CaptureBar placeholder="Capture…" />
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
              <span>{item.label}</span>
              <Badges item={item} />
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-hairline pt-4">
        <NavLink to="/review" className={linkClass}>
          <span>Weekly Review</span>
        </NavLink>
        <p
          className={`px-4 pt-1 font-mono text-[10px] uppercase tracking-wide ${
            reviewDue ? 'text-pale-red-ink' : 'text-muted'
          }`}
        >
          {reviewText}
        </p>
      </div>
      <DataControls />
    </nav>
  )
}

/** Phone layout: capture box on top, lists as a scrolling tab strip. */
export function MobileHeader() {
  const { items, reviewDue } = useNavItems()
  const all: NavItem[] = [...items, { to: '/review', label: 'Review', alert: reviewDue ? 1 : 0 }]
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
      isActive ? 'border-ink bg-ink text-canvas' : 'border-hairline text-muted'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 px-4 pb-2 pt-3 backdrop-blur md:hidden">
      <CaptureBar />
      <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {all.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={tabClass}>
            {item.label}
            {!!item.alert && (
              <span className="rounded-full bg-pale-red px-1.5 font-mono text-[10px] text-pale-red-ink">
                {item.to === '/review' ? '!' : item.alert}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </header>
  )
}

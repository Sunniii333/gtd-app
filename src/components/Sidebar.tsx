import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { stalledProjects, visibleNextActions } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'
import { daysBetween, formatLastReview, startOfDay } from '../utils/date'
import { CaptureButton } from './CaptureButton'
import { DataControls } from './DataControls'

interface NavItem {
  to: string
  label: string
  /** Label on the phone's bottom tab. */
  short: string
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
        { to: '/', label: 'Inbox', short: 'Inbox', alert: count('inbox') },
        {
          to: '/calendar',
          label: 'Calendar',
          short: 'Cal',
          count: calendar.filter((i) => i.date === today).length,
          alert: calendar.filter((i) => i.date! < today).length,
        },
        { to: '/next', label: 'Next Actions', short: 'Next', count: visibleNextActions(data).length },
        {
          to: '/projects',
          label: 'Projects',
          short: 'Proj',
          count: projects.filter((p) => p.status === 'active').length,
          alert: stalledProjects(data).length,
        },
        { to: '/waiting', label: 'Waiting For', short: 'Wait', count: count('waiting') },
        { to: '/someday', label: 'Someday/Maybe', short: 'Some', count: count('someday') },
        { to: '/reference', label: 'Reference', short: 'Ref', count: count('reference') },
      ],
    }
  }, [items, projects, lastReviewAt])
}

/** On the phone the first four lists get their own tab; the rest live under MORE. */
const PRIMARY = 4

function Badges({ item }: { item: NavItem }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
      {!!item.alert && <span className="font-semibold text-pale-red-ink">●{item.alert}</span>}
      {!!item.count && <span className="text-muted">{String(item.count).padStart(2, '0')}</span>}
    </span>
  )
}

function ReviewNote({ text, due }: { text: string; due: boolean }) {
  return due ? (
    <span className="-rotate-1 font-hand text-sm normal-case tracking-normal text-pale-red-ink">{text} — due!</span>
  ) : (
    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{text}</span>
  )
}

/** Desktop: the binder's index tabs, stacked down the left edge. */
export function Sidebar() {
  const { items, reviewText, reviewDue } = useNavItems()
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `-mr-px flex items-center justify-between gap-2 border border-r-0 px-3 py-2 text-xs uppercase tracking-[0.1em] transition-colors ${
      isActive
        ? 'border-rule bg-surface font-semibold text-ink'
        : 'border-transparent border-b-hairline text-muted hover:text-ink'
    }`

  return (
    <nav className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto py-8 pl-4 md:flex">
      <div className="mr-4 border border-rule px-3 py-2">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink">GTD</h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Flight data file</p>
      </div>
      <CaptureButton className="mr-4 mt-4 w-[calc(100%-1rem)] py-3" />
      <ul className="mt-8">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={tabClass}>
              <span>{item.label}</span>
              <Badges item={item} />
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <NavLink to="/review" className={tabClass}>
          <span>Weekly Review</span>
        </NavLink>
        <p className="px-3 pt-1">
          <ReviewNote text={reviewText} due={reviewDue} />
        </p>
      </div>
      <div className="mr-4">
        <DataControls />
      </div>
    </nav>
  )
}

/** Phone: paper tabs along the bottom edge, and the capture button in thumb reach. */
export function MobileHeader() {
  const { items, reviewText, reviewDue } = useNavItems()
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setMoreOpen(false), [pathname])

  const primary = items.slice(0, PRIMARY)
  const more = items.slice(PRIMARY)
  const moreActive = more.some((i) => pathname.startsWith(i.to)) || pathname === '/review'
  const moreAlert = reviewDue || more.some((i) => i.alert)

  const tabClass = (isActive: boolean) =>
    `relative flex flex-1 flex-col items-center justify-center gap-0.5 border-t-[1.5px] py-2 font-mono text-[10px] uppercase tracking-[0.12em] ${
      isActive ? 'border-rule bg-surface font-semibold text-ink' : 'border-transparent text-muted'
    }`

  return (
    <div className="md:hidden">
      <CaptureButton className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40 px-5 py-3.5" />

      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-ink/30" onClick={() => setMoreOpen(false)}>
          <div
            className="paper absolute inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] border-t-[1.5px] border-rule px-4 pb-4 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="border-b border-rule pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              More sections
            </p>
            <ul>
              {[...more, { to: '/review', label: 'Weekly Review', short: 'Review' } as NavItem].map((item) => (
                <li key={item.to} className="step flex items-center border-b border-dashed border-hairline">
                  <NavLink
                    to={item.to}
                    className="flex flex-1 items-center justify-between py-3 text-sm uppercase tracking-[0.08em] text-ink"
                  >
                    <span>{item.label}</span>
                    {item.to === '/review' ? <ReviewNote text={reviewText} due={reviewDue} /> : <Badges item={item} />}
                  </NavLink>
                </li>
              ))}
            </ul>
            <DataControls />
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-canvas pb-[env(safe-area-inset-bottom)]">
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => tabClass(isActive)}>
            <span>{item.short}</span>
            <span className="h-3.5">
              <Badges item={item} />
            </span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setMoreOpen((o) => !o)} className={tabClass(moreActive || moreOpen)}>
          <span>More</span>
          <span className="h-3.5 font-mono text-[11px] font-semibold text-pale-red-ink">{moreAlert ? '●' : ''}</span>
        </button>
      </nav>
    </div>
  )
}

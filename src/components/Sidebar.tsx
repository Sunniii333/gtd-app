import { NavLink } from 'react-router-dom'
import { useGtdStore } from '../store/useGtdStore'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center justify-between border-l-2 px-4 py-2 text-sm transition-colors ${
    isActive
      ? 'border-ink font-medium text-ink'
      : 'border-transparent text-muted hover:border-hairline hover:text-ink'
  }`

export function Sidebar() {
  const tasks = useGtdStore((s) => s.tasks)
  const projects = useGtdStore((s) => s.projects)

  const counts = {
    inbox: tasks.filter((t) => t.status === 'inbox').length,
    next: tasks.filter((t) => t.status === 'next').length,
    projects: projects.filter((p) => p.status === 'active').length,
    waiting: tasks.filter((t) => t.status === 'waiting').length,
    someday: tasks.filter((t) => t.status === 'someday').length,
  }

  const items: { to: string; label: string; count: number }[] = [
    { to: '/', label: 'Inbox', count: counts.inbox },
    { to: '/next', label: 'Next Actions', count: counts.next },
    { to: '/projects', label: 'Projects', count: counts.projects },
    { to: '/waiting', label: 'Waiting For', count: counts.waiting },
    { to: '/someday', label: 'Someday/Maybe', count: counts.someday },
  ]

  return (
    <nav className="w-60 shrink-0 border-r border-hairline bg-surface py-8">
      <h1 className="mb-8 px-4 font-serif text-2xl italic tracking-tight text-ink">GTD</h1>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="rounded border border-hairline px-1.5 font-mono text-[11px] text-muted">
                  {item.count}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

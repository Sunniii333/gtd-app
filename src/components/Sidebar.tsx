import { NavLink } from 'react-router-dom'
import { useGtdStore } from '../store/useGtdStore'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-violet-600 text-white'
      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
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
    <nav className="w-56 shrink-0 border-r border-neutral-200 p-4 dark:border-neutral-800">
      <h1 className="mb-4 px-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        GTD
      </h1>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="rounded-full bg-black/10 px-2 text-xs dark:bg-white/10">
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

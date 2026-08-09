import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGtdStore } from '../store/useGtdStore'
import { TaskItem } from '../components/TaskItem'
import { startOfDay } from '../utils/date'

export function Today() {
  const allTasks = useGtdStore((s) => s.tasks)
  const projects = useGtdStore((s) => s.projects)
  const [filter, setFilter] = useState<string>('')
  const today = startOfDay()

  const { due, arrived } = useMemo(() => {
    const actionable = allTasks.filter((t) => t.status === 'next')
    const dueTasks = actionable
      .filter((t) => t.dueDate !== undefined && t.dueDate <= today)
      .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0))
    const dueIds = new Set(dueTasks.map((t) => t.id))
    // Deferred items that have reached their day: they were hidden, now they are not.
    const arrivedTasks = actionable.filter(
      (t) => !dueIds.has(t.id) && t.deferUntil !== undefined && t.deferUntil <= today,
    )
    return { due: dueTasks, arrived: arrivedTasks }
  }, [allTasks, today])

  const allContexts = useMemo(
    () => Array.from(new Set([...due, ...arrived].flatMap((t) => t.contexts))).sort(),
    [due, arrived],
  )

  const byContext = (tasks: typeof due) =>
    filter ? tasks.filter((t) => t.contexts.includes(filter)) : tasks

  const visibleDue = byContext(due)
  const visibleArrived = byContext(arrived)
  const isEmpty = visibleDue.length === 0 && visibleArrived.length === 0

  const projectName = (id?: string) => projects.find((p) => p.id === id)?.name

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <h2 className="font-serif text-3xl italic tracking-tight text-ink">Today</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        What the calendar says must happen, plus anything that just became available.
      </p>

      {allContexts.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('')}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filter === ''
                ? 'border-ink bg-ink text-canvas'
                : 'border-hairline text-muted hover:border-ink hover:text-ink'
            }`}
          >
            All
          </button>
          {allContexts.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                filter === c
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-hairline text-muted hover:border-ink hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted">Nothing is due and nothing new arrived.</p>
          <Link to="/next" className="mt-2 inline-block text-xs text-ink underline">
            Pick from Next Actions
          </Link>
        </div>
      )}

      {visibleDue.length > 0 && (
        <section className="mt-8">
          <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted">
            Due or overdue
          </h3>
          <ul className="mt-2">
            {visibleDue.map((task) => (
              <TaskItem key={task.id} task={task} projectName={projectName(task.projectId)} />
            ))}
          </ul>
        </section>
      )}

      {visibleArrived.length > 0 && (
        <section className="mt-8">
          <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted">
            Now available
          </h3>
          <ul className="mt-2">
            {visibleArrived.map((task) => (
              <TaskItem key={task.id} task={task} projectName={projectName(task.projectId)} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

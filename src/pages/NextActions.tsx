import { useMemo, useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { TaskItem } from '../components/TaskItem'
import { startOfDay } from '../utils/date'

export function NextActions() {
  const allTasks = useGtdStore((s) => s.tasks)
  const projects = useGtdStore((s) => s.projects)
  const [filter, setFilter] = useState<string>('')
  const today = startOfDay()

  const nextTasks = useMemo(() => allTasks.filter((t) => t.status === 'next'), [allTasks])

  // A deferred task is not actionable yet, so it stays out of the list entirely.
  const available = useMemo(
    () => nextTasks.filter((t) => t.deferUntil === undefined || t.deferUntil <= today),
    [nextTasks, today],
  )
  const deferredCount = nextTasks.length - available.length

  const allContexts = useMemo(
    () => Array.from(new Set(available.flatMap((t) => t.contexts))).sort(),
    [available],
  )

  const visible = useMemo(() => {
    const byContext = filter ? available.filter((t) => t.contexts.includes(filter)) : available
    // Soonest deadline first; undated tasks keep their existing order behind them.
    return [...byContext].sort((a, b) => {
      if (a.dueDate !== undefined && b.dueDate !== undefined) return a.dueDate - b.dueDate
      if (a.dueDate !== undefined) return -1
      if (b.dueDate !== undefined) return 1
      return 0
    })
  }, [available, filter])

  const projectName = (id?: string) => projects.find((p) => p.id === id)?.name

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <h2 className="font-serif text-3xl italic tracking-tight text-ink">Next Actions</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Everything you could physically do right now, one context at a time.
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

      <ul className="mt-8">
        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">No next actions here.</p>
        )}
        {visible.map((task) => (
          <TaskItem key={task.id} task={task} projectName={projectName(task.projectId)} />
        ))}
      </ul>

      {deferredCount > 0 && (
        <p className="mt-6 border-t border-hairline pt-4 font-mono text-[11px] uppercase tracking-wide text-muted">
          {deferredCount} deferred to a later date
        </p>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { TaskItem } from '../components/TaskItem'

export function NextActions() {
  const allTasks = useGtdStore((s) => s.tasks)
  const tasks = useMemo(() => allTasks.filter((t) => t.status === 'next'), [allTasks])
  const projects = useGtdStore((s) => s.projects)
  const [filter, setFilter] = useState<string>('')

  const allContexts = useMemo(
    () => Array.from(new Set(tasks.flatMap((t) => t.contexts))).sort(),
    [tasks],
  )

  const filtered = filter ? tasks.filter((t) => t.contexts.includes(filter)) : tasks
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
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">No next actions here.</p>
        )}
        {filtered.map((task) => (
          <TaskItem key={task.id} task={task} projectName={projectName(task.projectId)} />
        ))}
      </ul>
    </div>
  )
}

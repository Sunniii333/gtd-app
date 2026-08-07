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
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Next Actions
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Everything you could physically do right now, one context at a time.
      </p>

      {allContexts.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === ''
                ? 'bg-violet-600 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            All
          </button>
          {allContexts.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === c
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">No next actions here.</p>
        )}
        {filtered.map((task) => (
          <TaskItem key={task.id} task={task} projectName={projectName(task.projectId)} />
        ))}
      </ul>
    </div>
  )
}

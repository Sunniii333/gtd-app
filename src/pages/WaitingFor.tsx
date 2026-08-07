import { useMemo } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { TaskItem } from '../components/TaskItem'

export function WaitingFor() {
  const allTasks = useGtdStore((s) => s.tasks)
  const tasks = useMemo(() => allTasks.filter((t) => t.status === 'waiting'), [allTasks])
  const clarifyToNext = useGtdStore((s) => s.clarifyToNext)

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <h2 className="font-serif text-3xl italic tracking-tight text-ink">Waiting For</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Things delegated or blocked on someone else.
      </p>

      <ul className="mt-8">
        {tasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">Nothing pending on others.</p>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            extra={
              <button
                type="button"
                onClick={() => clarifyToNext(task.id, task.contexts, task.projectId)}
                className="shrink-0 rounded-md border border-hairline px-2.5 py-1 text-xs font-medium text-muted hover:border-ink hover:text-ink"
              >
                Move to Next
              </button>
            }
          />
        ))}
      </ul>
    </div>
  )
}

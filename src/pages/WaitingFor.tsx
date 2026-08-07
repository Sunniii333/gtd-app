import { useMemo } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { TaskItem } from '../components/TaskItem'

export function WaitingFor() {
  const allTasks = useGtdStore((s) => s.tasks)
  const tasks = useMemo(() => allTasks.filter((t) => t.status === 'waiting'), [allTasks])
  const clarifyToNext = useGtdStore((s) => s.clarifyToNext)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Waiting For
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Things delegated or blocked on someone else.
      </p>

      <ul>
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">Nothing pending on others.</p>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            extra={
              <button
                type="button"
                onClick={() => clarifyToNext(task.id, task.contexts, task.projectId)}
                className="shrink-0 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
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

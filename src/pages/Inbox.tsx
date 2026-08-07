import { useMemo, useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { QuickAddInput } from '../components/QuickAddInput'
import { ClarifyDialog } from '../components/ClarifyDialog'
import type { Task } from '../types'

export function Inbox() {
  const allTasks = useGtdStore((s) => s.tasks)
  const tasks = useMemo(() => allTasks.filter((t) => t.status === 'inbox'), [allTasks])
  const deleteTask = useGtdStore((s) => s.deleteTask)
  const [clarifying, setClarifying] = useState<Task | null>(null)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Inbox
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Capture anything on your mind, then clarify each item into what it really is.
      </p>

      <QuickAddInput />

      <ul className="mt-6">
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">Inbox zero. Nice.</p>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between gap-3 border-b border-neutral-200 py-3 last:border-0 dark:border-neutral-800"
          >
            <span className="text-sm text-neutral-900 dark:text-neutral-100">{task.title}</span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setClarifying(task)}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
              >
                Clarify
              </button>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="text-neutral-400 hover:text-red-500"
                aria-label="Delete task"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      {clarifying && <ClarifyDialog task={clarifying} onClose={() => setClarifying(null)} />}
    </div>
  )
}

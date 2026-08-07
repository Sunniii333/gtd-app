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
    <div className="mx-auto max-w-2xl px-8 py-16">
      <h2 className="font-serif text-3xl italic tracking-tight text-ink">Inbox</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Capture anything on your mind, then clarify each item into what it really is.
      </p>

      <div className="mt-8">
        <QuickAddInput />
      </div>

      <ul className="mt-8">
        {tasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">Inbox zero. Nice.</p>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between gap-3 border-b border-hairline py-4 last:border-0"
          >
            <span className="text-sm text-ink">{task.title}</span>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setClarifying(task)}
                className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-canvas transition-[background-color,transform] hover:bg-neutral-700 active:scale-[0.98]"
              >
                Clarify
              </button>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="text-muted hover:text-pale-red-ink"
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

import type { ReactNode } from 'react'
import type { Task } from '../types'
import { useGtdStore } from '../store/useGtdStore'
import { ContextChip } from './ContextChip'

interface TaskItemProps {
  task: Task
  projectName?: string
  extra?: ReactNode
}

export function TaskItem({ task, projectName, extra }: TaskItemProps) {
  const completeTask = useGtdStore((s) => s.completeTask)
  const deleteTask = useGtdStore((s) => s.deleteTask)

  return (
    <li className="flex items-start gap-3 border-b border-hairline py-4 last:border-0">
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={() => completeTask(task.id)}
        className="mt-1 h-4 w-4 accent-ink"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {projectName && (
            <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
              {projectName}
            </span>
          )}
          {task.contexts.map((c) => (
            <ContextChip key={c} label={c} />
          ))}
          {task.waitingOn && (
            <span className="rounded-full bg-pale-yellow px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-pale-yellow-ink">
              waiting on {task.waitingOn}
            </span>
          )}
        </div>
      </div>
      {extra}
      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        className="text-muted hover:text-pale-red-ink"
        aria-label="Delete task"
      >
        ×
      </button>
    </li>
  )
}

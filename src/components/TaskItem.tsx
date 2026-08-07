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
    <li className="flex items-start gap-3 border-b border-neutral-200 py-3 last:border-0 dark:border-neutral-800">
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={() => completeTask(task.id)}
        className="mt-1 h-4 w-4 accent-violet-600"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {projectName && (
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {projectName}
            </span>
          )}
          {task.contexts.map((c) => (
            <ContextChip key={c} label={c} />
          ))}
          {task.waitingOn && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              waiting on {task.waitingOn}
            </span>
          )}
        </div>
      </div>
      {extra}
      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        className="text-neutral-400 hover:text-red-500"
        aria-label="Delete task"
      >
        ×
      </button>
    </li>
  )
}

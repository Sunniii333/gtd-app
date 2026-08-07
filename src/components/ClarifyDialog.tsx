import { useState } from 'react'
import type { Task } from '../types'
import { useGtdStore } from '../store/useGtdStore'

interface ClarifyDialogProps {
  task: Task
  onClose: () => void
}

type Mode = 'next' | 'project' | 'waiting' | 'someday'

export function ClarifyDialog({ task, onClose }: ClarifyDialogProps) {
  const [mode, setMode] = useState<Mode>('next')
  const [contexts, setContexts] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [waitingOn, setWaitingOn] = useState('')

  const projects = useGtdStore((s) => s.projects)
  const clarifyToNext = useGtdStore((s) => s.clarifyToNext)
  const clarifyToWaiting = useGtdStore((s) => s.clarifyToWaiting)
  const clarifyToSomeday = useGtdStore((s) => s.clarifyToSomeday)
  const clarifyToProject = useGtdStore((s) => s.clarifyToProject)
  const completeTask = useGtdStore((s) => s.completeTask)
  const deleteTask = useGtdStore((s) => s.deleteTask)

  const submit = () => {
    const parsedContexts = contexts
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => (c.startsWith('@') ? c : `@${c}`))

    if (mode === 'next') {
      clarifyToNext(task.id, parsedContexts, projectId || undefined)
    } else if (mode === 'project') {
      if (!projectName.trim()) return
      clarifyToProject(task.id, projectName.trim())
    } else if (mode === 'waiting') {
      if (!waitingOn.trim()) return
      clarifyToWaiting(task.id, waitingOn.trim())
    } else if (mode === 'someday') {
      clarifyToSomeday(task.id)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-neutral-900">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Clarify: {task.title}
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(
            [
              ['next', 'Next Action'],
              ['project', 'New Project'],
              ['waiting', 'Waiting For'],
              ['someday', 'Someday/Maybe'],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                mode === m
                  ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                  : 'border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {mode === 'next' && (
            <>
              <label className="block text-xs font-medium text-neutral-500">
                Contexts (comma separated, e.g. home, calls)
                <input
                  type="text"
                  value={contexts}
                  onChange={(e) => setContexts(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>
              <label className="block text-xs font-medium text-neutral-500">
                Project (optional)
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {mode === 'project' && (
            <label className="block text-xs font-medium text-neutral-500">
              Project name
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                placeholder={task.title}
              />
            </label>
          )}

          {mode === 'waiting' && (
            <label className="block text-xs font-medium text-neutral-500">
              Waiting on whom?
              <input
                type="text"
                value={waitingOn}
                onChange={(e) => setWaitingOn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
          )}

          {mode === 'someday' && (
            <p className="text-sm text-neutral-500">
              This will move to Someday/Maybe for future review.
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                completeTask(task.id)
                onClose()
              }}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Mark done
            </button>
            <button
              type="button"
              onClick={() => {
                deleteTask(task.id)
                onClose()
              }}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

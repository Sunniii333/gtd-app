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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-4">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-surface p-6 shadow-[0_2px_24px_rgba(0,0,0,0.04)]">
        <h3 className="font-serif text-lg italic text-ink">Clarify: {task.title}</h3>

        <div className="mt-5 grid grid-cols-2 gap-2">
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
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                mode === m
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-hairline text-muted hover:border-ink hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {mode === 'next' && (
            <>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                Contexts (comma separated, e.g. home, calls)
                <input
                  type="text"
                  value={contexts}
                  onChange={(e) => setContexts(e.target.value)}
                  className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                Project (optional)
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
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
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Project name
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                placeholder={task.title}
              />
            </label>
          )}

          {mode === 'waiting' && (
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Waiting on whom?
              <input
                type="text"
                value={waitingOn}
                onChange={(e) => setWaitingOn(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
              />
            </label>
          )}

          {mode === 'someday' && (
            <p className="text-sm text-muted">
              This will move to Someday/Maybe for future review.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                completeTask(task.id)
                onClose()
              }}
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Mark done
            </button>
            <button
              type="button"
              onClick={() => {
                deleteTask(task.id)
                onClose()
              }}
              className="text-xs font-medium text-pale-red-ink hover:opacity-70"
            >
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-[background-color,transform] hover:bg-neutral-700 active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

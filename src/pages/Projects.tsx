import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGtdStore } from '../store/useGtdStore'

export function Projects() {
  const allProjects = useGtdStore((s) => s.projects)
  const projects = useMemo(() => allProjects.filter((p) => p.status === 'active'), [allProjects])
  const tasks = useGtdStore((s) => s.tasks)
  const addProject = useGtdStore((s) => s.addProject)
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addProject(trimmed)
    setName('')
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-16">
      <h2 className="font-serif text-3xl italic tracking-tight text-ink">Projects</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Any outcome that takes more than one next action.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="mt-8 flex gap-2"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="flex-1 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-[background-color,transform] hover:bg-neutral-700 active:scale-[0.98]"
        >
          Add
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No active projects yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const linkedCount = tasks.filter(
              (t) => t.projectId === project.id && t.status === 'next',
            ).length
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group rounded-xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
              >
                <p className="text-sm font-medium text-ink group-hover:underline">
                  {project.name}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-muted">
                  {linkedCount} next action{linkedCount === 1 ? '' : 's'}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

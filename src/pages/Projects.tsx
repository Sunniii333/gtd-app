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
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Projects
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Any outcome that takes more than one next action.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Add
        </button>
      </form>

      <ul className="mt-6">
        {projects.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">No active projects yet.</p>
        )}
        {projects.map((project) => {
          const linkedCount = tasks.filter(
            (t) => t.projectId === project.id && t.status === 'next',
          ).length
          return (
            <li
              key={project.id}
              className="flex items-center justify-between border-b border-neutral-200 py-3 last:border-0 dark:border-neutral-800"
            >
              <Link
                to={`/projects/${project.id}`}
                className="text-sm font-medium text-neutral-900 hover:text-violet-600 dark:text-neutral-100"
              >
                {project.name}
              </Link>
              <span className="text-xs text-neutral-400">
                {linkedCount} next action{linkedCount === 1 ? '' : 's'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGtdStore } from '../store/useGtdStore'
import { TaskItem } from '../components/TaskItem'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = useGtdStore((s) => s.projects.find((p) => p.id === id))
  const allTasks = useGtdStore((s) => s.tasks)
  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === id), [allTasks, id])
  const setProjectStatus = useGtdStore((s) => s.setProjectStatus)
  const addTaskToProject = useGtdStore((s) => s.addTaskToProject)
  const [newAction, setNewAction] = useState('')

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-16">
        <p className="text-sm text-muted">Project not found.</p>
        <Link to="/projects" className="text-sm text-ink underline">
          Back to projects
        </Link>
      </div>
    )
  }

  const addAction = () => {
    const title = newAction.trim()
    if (!title) return
    addTaskToProject(title, project.id)
    setNewAction('')
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <Link to="/projects" className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-ink">
        ← Projects
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h2 className="font-serif text-3xl italic tracking-tight text-ink">{project.name}</h2>
        <button
          type="button"
          onClick={() => {
            setProjectStatus(project.id, 'completed')
            navigate('/projects')
          }}
          className="text-xs font-medium text-muted hover:text-ink"
        >
          Mark project complete
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          addAction()
        }}
        className="mt-8 flex gap-2"
      >
        <input
          type="text"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          placeholder="Add a next action for this project"
          className="flex-1 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-[background-color,transform] hover:bg-neutral-700 active:scale-[0.98]"
        >
          Add
        </button>
      </form>

      <ul className="mt-8">
        {tasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">No actions linked yet.</p>
        )}
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  )
}

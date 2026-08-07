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
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-neutral-500">Project not found.</p>
        <Link to="/projects" className="text-sm text-violet-600">
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
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/projects" className="text-xs text-neutral-400 hover:text-violet-600">
        ← Projects
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {project.name}
        </h2>
        <button
          type="button"
          onClick={() => {
            setProjectStatus(project.id, 'completed')
            navigate('/projects')
          }}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Mark project complete
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          addAction()
        }}
        className="mt-4 flex gap-2"
      >
        <input
          type="text"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          placeholder="Add a next action for this project"
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
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            No actions linked yet.
          </p>
        )}
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  )
}

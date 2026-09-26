import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../types'
import { useGtdStore } from '../store/useGtdStore'
import { NextStepForm } from './NextStepForm'
import { Button } from './ui'

/** A stalled project with its fix right beside it: decide the next action here. */
export function StalledProjectCard({ project }: { project: Project }) {
  const addItem = useGtdStore((s) => s.addItem)
  const completeProject = useGtdStore((s) => s.completeProject)
  const setProjectStatus = useGtdStore((s) => s.setProjectStatus)
  const [open, setOpen] = useState(false)

  return (
    <li className="rounded-xl border border-hairline bg-pale-red/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/projects/${project.id}`} className="text-sm font-medium text-ink hover:underline">
            {project.name}
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-wide text-pale-red-ink">
            stalled — nothing in motion
          </p>
        </div>
        {!open && (
          <Button variant="primary" className="text-xs" onClick={() => setOpen(true)}>
            Decide next action
          </Button>
        )}
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          {project.outcome && <p className="text-xs text-muted">Toward: {project.outcome}</p>}
          <NextStepForm autoFocus projectId={project.id} submitLabel="Add" onSubmit={addItem} />
          <div className="flex flex-wrap gap-2">
            <Button className="text-xs" onClick={() => completeProject(project.id)}>
              ✓ It’s actually done
            </Button>
            <Button className="text-xs" onClick={() => setProjectStatus(project.id, 'someday')}>
              Park in Someday/Maybe
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

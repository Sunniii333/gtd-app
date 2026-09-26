import { useGtdStore } from '../store/useGtdStore'
import { isOpen } from '../domain/gtd'
import { formatDay } from '../utils/date'
import { NextStepForm } from './NextStepForm'
import { Button, Modal, chipClass } from './ui'

/**
 * Shown whenever an action of an active project is finished (or its last open action
 * removed). The book's rule is that every project always has a next action; this is
 * the moment to decide it, while the context is still fresh.
 */
export function FollowUpDialog() {
  const projectId = useGtdStore((s) => s.followUpProjectId)
  const project = useGtdStore((s) => s.projects.find((p) => p.id === s.followUpProjectId))
  const items = useGtdStore((s) => s.items)
  const addItem = useGtdStore((s) => s.addItem)
  const completeProject = useGtdStore((s) => s.completeProject)
  const setProjectStatus = useGtdStore((s) => s.setProjectStatus)
  const dismiss = useGtdStore((s) => s.dismissFollowUp)

  if (!projectId || !project) return null

  const projectItems = items.filter((i) => i.projectId === project.id)
  const open = projectItems.filter(isOpen)
  const justDone = projectItems
    .filter((i) => i.status === 'done')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0]

  return (
    <Modal>
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Project · {project.name}</p>
      {justDone && <p className="mt-1 text-sm text-muted line-through">{justDone.title}</p>}
      <h3 className="mt-3 font-serif text-2xl italic text-ink">What’s the next action?</h3>
      {project.outcome && (
        <p className="mt-1 text-sm text-muted">
          Toward: <span className="text-ink">{project.outcome}</span>
        </p>
      )}

      {open.length > 0 && (
        <div className="mt-5 rounded-lg border border-hairline p-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Already in motion</p>
          <ul className="mt-2 space-y-1.5">
            {open.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2 text-sm text-ink">
                {i.title}
                {i.status === 'waiting' && <span className={chipClass}>waiting · {i.waitingOn}</span>}
                {i.status === 'calendar' && i.date !== undefined && (
                  <span className={chipClass}>{formatDay(i.date)}</span>
                )}
                {i.status === 'next' && i.context && <span className={chipClass}>{i.context}</span>}
              </li>
            ))}
          </ul>
          <Button variant="primary" className="mt-3 w-full" onClick={dismiss}>
            That’s still the next step — continue
          </Button>
        </div>
      )}

      <div className="mt-5">
        <NextStepForm
          autoFocus={open.length === 0}
          projectId={project.id}
          submitLabel="Add next action"
          onSubmit={(fields) => {
            addItem(fields)
            dismiss()
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => completeProject(project.id)}>✓ Project is done</Button>
          <Button onClick={() => setProjectStatus(project.id, 'someday')}>Park in Someday/Maybe</Button>
        </div>
        <Button variant="ghost" onClick={dismiss} title="It will be flagged as stalled until it has a next action">
          Decide later
        </Button>
      </div>
    </Modal>
  )
}

import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EditButton, EditForm } from '../components/EditForm'
import { ItemRow } from '../components/ItemRow'
import { NextStepForm } from '../components/NextStepForm'
import { Button, Page, SectionTitle, inputClass } from '../components/ui'
import { isOpen } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const project = useGtdStore((s) => s.projects.find((p) => p.id === id))
  const allItems = useGtdStore((s) => s.items)
  const addItem = useGtdStore((s) => s.addItem)
  const updateProject = useGtdStore((s) => s.updateProject)
  const editProject = useGtdStore((s) => s.editProject)
  const completeProject = useGtdStore((s) => s.completeProject)
  const setProjectStatus = useGtdStore((s) => s.setProjectStatus)
  const askWhatsNext = useGtdStore((s) => s.askWhatsNext)
  const [showDone, setShowDone] = useState(false)
  const [editing, setEditing] = useState(false)

  const { open, parked, done } = useMemo(() => {
    const mine = allItems.filter((i) => i.projectId === id)
    return {
      open: mine.filter(isOpen),
      parked: mine.filter((i) => i.status === 'someday'),
      done: mine
        .filter((i) => i.status === 'done')
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    }
  }, [allItems, id])

  if (!project) {
    return (
      <Page title="Project not found">
        <Link to="/projects" className="text-sm text-ink underline">
          Back to projects
        </Link>
      </Page>
    )
  }

  const stalled = project.status === 'active' && open.length === 0

  const finish = () => {
    if (
      open.length === 0 ||
      window.confirm(`${open.length} open action(s) will be closed with the project. Continue?`)
    ) {
      completeProject(project.id)
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-8">
        <Link to="/projects" className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted hover:text-ink">
          ← Projects
        </Link>
      </div>
      <Page
        title={project.name}
        action={project.status !== 'done' && !editing && <EditButton label="Edit project name" onClick={() => setEditing(true)} />}
        subtitle={
          project.status === 'done'
            ? 'Completed.'
            : project.status === 'someday'
              ? 'Parked in Someday/Maybe.'
              : undefined
        }
      >
        {editing && (
          <div className="mb-6">
            <EditForm
              title={project.name}
              onSave={({ title }) => {
                editProject(project.id, title)
                setEditing(false)
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}
        <label className="block">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted">Outcome — what “done” looks like</span>
          <textarea
            // Keyed so an import or edit elsewhere refreshes the field.
            key={project.outcome}
            defaultValue={project.outcome}
            rows={2}
            onBlur={(e) => updateProject(project.id, { outcome: e.target.value.trim() || undefined })}
            placeholder="Describe the finished result"
            className={`mt-1 ${inputClass}`}
          />
        </label>

        {project.status === 'active' && (
          <>
            {stalled && (
              <div className="mt-6 border-[1.5px] border-dashed border-pale-red-ink p-4 text-sm text-pale-red-ink">
                Nothing is in motion. What’s the next action?
              </div>
            )}
            <SectionTitle>In motion · {open.length}</SectionTitle>
            <ul>
              {open.map((item) => (
                <ItemRow key={item.id} item={item} showProject={false} />
              ))}
            </ul>
            <div className="mt-4 border border-rule bg-surface p-4">
              <NextStepForm projectId={project.id} submitLabel="Add action" onSubmit={addItem} autoFocus={stalled} />
            </div>
          </>
        )}

        {parked.length > 0 && (
          <>
            <SectionTitle>Someday for this project</SectionTitle>
            <ul>
              {parked.map((item) => (
                <ItemRow key={item.id} item={item} showProject={false} />
              ))}
            </ul>
          </>
        )}

        {done.length > 0 && (
          <div className="mt-8">
            <Button variant="ghost" onClick={() => setShowDone((s) => !s)}>
              {showDone ? 'Hide' : 'Show'} completed actions ({done.length})
            </Button>
            {showDone && (
              <ul>
                {done.map((item) => (
                  <ItemRow key={item.id} item={item} showProject={false} />
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-2 border-t border-hairline pt-4">
          {project.status === 'active' && (
            <>
              <Button onClick={finish}>✓ Project is done</Button>
              <Button onClick={() => setProjectStatus(project.id, 'someday')}>Park in Someday/Maybe</Button>
            </>
          )}
          {project.status !== 'active' && (
            <Button
              onClick={() => {
                setProjectStatus(project.id, 'active')
                if (open.length === 0) askWhatsNext(project.id)
              }}
            >
              Make active again
            </Button>
          )}
        </div>
      </Page>
    </div>
  )
}

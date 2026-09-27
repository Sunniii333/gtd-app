import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NextStepForm } from '../components/NextStepForm'
import { StalledProjectCard } from '../components/StalledProjectCard'
import { Button, Empty, Page, SectionTitle, inputClass, labelClass } from '../components/ui'
import { isOpen, stalledProjects } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'

function NewProjectForm({ onDone }: { onDone: () => void }) {
  const createProject = useGtdStore((s) => s.createProject)
  const [name, setName] = useState('')
  const [outcome, setOutcome] = useState('')

  return (
    <div className="mb-8 space-y-3 border border-rule bg-surface p-4">
      <label className={labelClass}>
        Project
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${inputClass}`} />
      </label>
      <label className={labelClass}>
        What does “done” look like?
        <input
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="The successful outcome, stated as if it already happened"
          className={`mt-1 ${inputClass}`}
        />
      </label>
      <p className={`${labelClass} pt-2`}>Very next action</p>
      <NextStepForm
        submitLabel="Create project"
        blocked={!name.trim()}
        onSubmit={(firstAction) => {
          if (!name.trim()) return
          createProject({ name: name.trim(), outcome: outcome.trim() || undefined, firstAction })
          onDone()
        }}
      />
    </div>
  )
}

export function Projects() {
  const items = useGtdStore((s) => s.items)
  const projects = useGtdStore((s) => s.projects)
  const [adding, setAdding] = useState(false)
  const [showDone, setShowDone] = useState(false)

  const { stalled, moving, done } = useMemo(() => {
    const stalledList = stalledProjects({ items, projects })
    const stalledIds = new Set(stalledList.map((p) => p.id))
    return {
      stalled: stalledList,
      moving: projects.filter((p) => p.status === 'active' && !stalledIds.has(p.id)),
      done: projects.filter((p) => p.status === 'done'),
    }
  }, [items, projects])

  const openCount = (id: string) => items.filter((i) => i.projectId === id && isOpen(i)).length

  return (
    <Page
      title="Projects"
      subtitle="Every outcome that takes more than one action. Each one needs something in motion at all times."
      action={<Button onClick={() => setAdding((a) => !a)}>{adding ? 'Close' : '+ New'}</Button>}
    >
      {adding && <NewProjectForm onDone={() => setAdding(false)} />}

      {stalled.length > 0 && (
        <>
          <SectionTitle tone="warn">Needs a next action · {stalled.length}</SectionTitle>
          <ul className="space-y-2">
            {stalled.map((p) => (
              <StalledProjectCard key={p.id} project={p} />
            ))}
          </ul>
        </>
      )}

      <SectionTitle>Active · {moving.length}</SectionTitle>
      {moving.length === 0 && stalled.length === 0 ? (
        <Empty>No active projects.</Empty>
      ) : (
        <ul>
          {moving.map((p) => (
            <li key={p.id} className="border-b border-hairline last:border-0">
              <Link to={`/projects/${p.id}`} className="flex items-center justify-between gap-3 py-3.5 hover:underline">
                <span className="min-w-0">
                  <span className="block text-sm text-ink">{p.name}</span>
                  {p.outcome && <span className="block truncate text-xs text-muted">{p.outcome}</span>}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted">{openCount(p.id)} open</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="mt-8">
          <Button variant="ghost" onClick={() => setShowDone((s) => !s)}>
            {showDone ? 'Hide' : 'Show'} completed ({done.length})
          </Button>
          {showDone && (
            <ul className="mt-2">
              {done.map((p) => (
                <li key={p.id} className="py-1.5 text-sm text-muted line-through">
                  <Link to={`/projects/${p.id}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Page>
  )
}

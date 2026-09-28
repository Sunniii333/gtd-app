import { useState } from 'react'
import type { Item } from '../types'
import { useGtdStore } from '../store/useGtdStore'
import { fromDateInput } from '../utils/date'
import { NextStepForm } from './NextStepForm'
import { Button, Modal, inputClass, labelClass } from './ui'

type Step = 'actionable' | 'not-actionable' | 'someday' | 'reference' | 'project?' | 'project' | 'two-minutes' | 'next'

function Question({ children }: { children: string }) {
  return <p className="text-base font-semibold uppercase tracking-[0.08em] text-ink">{children}</p>
}

function Choice({ title, hint, onClick }: { title: string; hint?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-hairline px-4 py-3 text-left transition-colors hover:border-ink"
    >
      <span className="block text-sm font-medium text-ink">{title}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
    </button>
  )
}

/** The book's processing flowchart, one question at a time. */
export function ClarifyDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const [history, setHistory] = useState<Step[]>(['actionable'])
  const step = history[history.length - 1]
  const go = (next: Step) => setHistory((h) => [...h, next])
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))

  const projects = useGtdStore((s) => s.projects)
  const fileItem = useGtdStore((s) => s.fileItem)
  const completeItem = useGtdStore((s) => s.completeItem)
  const deleteItem = useGtdStore((s) => s.deleteItem)
  const createProject = useGtdStore((s) => s.createProject)

  const [tickler, setTickler] = useState('')
  const [notes, setNotes] = useState(item.notes ?? '')
  const [projectName, setProjectName] = useState(item.title)
  const [outcome, setOutcome] = useState('')
  const [projectId, setProjectId] = useState('')

  const done = (fn: () => void) => {
    fn()
    onClose()
  }
  const activeProjects = projects.filter((p) => p.status === 'active')

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted">Clarify</p>
        <Button variant="ghost" onClick={onClose} aria-label="Close">
          ✕
        </Button>
      </div>
      <p className="mt-1 text-base text-ink">{item.title}</p>

      <div className="mt-6 space-y-3">
        {step === 'actionable' && (
          <>
            <Question>Is it actionable?</Question>
            <Choice title="Yes" hint="There is something to do about it" onClick={() => go('project?')} />
            <Choice title="No" hint="Nothing to do right now" onClick={() => go('not-actionable')} />
          </>
        )}

        {step === 'not-actionable' && (
          <>
            <Question>Then what is it?</Question>
            <Choice title="Trash" hint="Not needed" onClick={() => done(() => deleteItem(item.id))} />
            <Choice
              title="Someday/Maybe"
              hint="Might want to act on it later — incubate it"
              onClick={() => go('someday')}
            />
            <Choice
              title="Reference"
              hint="Useful information, no action needed"
              onClick={() => go('reference')}
            />
          </>
        )}

        {step === 'someday' && (
          <>
            <Question>Want a reminder on a day?</Question>
            <label className={labelClass}>
              Tickler date (optional)
              <input
                type="date"
                value={tickler}
                onChange={(e) => setTickler(e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <p className="text-xs leading-relaxed text-muted">
              On that day it comes back to your Inbox to decide again. Without a date, you’ll see
              it in every Weekly Review.
            </p>
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() =>
                  done(() =>
                    fileItem(item.id, {
                      title: item.title,
                      status: 'someday',
                      ticklerDate: fromDateInput(tickler),
                    }),
                  )
                }
              >
                Incubate
              </Button>
            </div>
          </>
        )}

        {step === 'reference' && (
          <>
            <Question>Anything worth noting with it?</Question>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Notes, links, numbers…"
              className={inputClass}
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() =>
                  done(() =>
                    fileItem(item.id, {
                      title: item.title,
                      status: 'reference',
                      notes: notes.trim() || undefined,
                    }),
                  )
                }
              >
                File as reference
              </Button>
            </div>
          </>
        )}

        {step === 'project?' && (
          <>
            <Question>Does it take more than one action to finish?</Question>
            <Choice
              title="Yes — it’s a project"
              hint="Define the outcome and the very next action"
              onClick={() => go('project')}
            />
            <Choice title="No — one action does it" onClick={() => go('two-minutes')} />
          </>
        )}

        {step === 'project' && (
          <>
            <label className={labelClass}>
              Project
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className={labelClass}>
              What does “done” look like?
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g. New website live and announced"
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <div className="border-t border-hairline pt-4">
              <Question>What’s the very next action?</Question>
              <div className="mt-3">
                <NextStepForm
                  submitLabel="Create project"
                  blocked={!projectName.trim()}
                  onSubmit={(firstAction) =>
                    done(() =>
                      createProject({
                        name: projectName.trim(),
                        outcome: outcome.trim() || undefined,
                        firstAction,
                        fromItemId: item.id,
                      }),
                    )
                  }
                />
              </div>
            </div>
          </>
        )}

        {step === 'two-minutes' && (
          <>
            <Question>Can you do it in less than two minutes?</Question>
            <Choice
              title="Yes — do it now"
              hint="Do it, then tap Done"
              onClick={() => done(() => completeItem(item.id))}
            />
            <Choice title="No" hint="Delegate it or defer it" onClick={() => go('next')} />
          </>
        )}

        {step === 'next' && (
          <>
            <Question>What’s the next action?</Question>
            {activeProjects.length > 0 && (
              <label className={labelClass}>
                Part of a project? (optional)
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="">No project</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <NextStepForm
              initialTitle={item.title}
              projectId={projectId || undefined}
              onSubmit={(fields) => done(() => fileItem(item.id, fields))}
            />
          </>
        )}
      </div>

      {history.length > 1 && (
        <div className="mt-4 border-t border-hairline pt-3">
          <Button variant="ghost" onClick={back}>
            ← Back
          </Button>
        </div>
      )}
    </Modal>
  )
}

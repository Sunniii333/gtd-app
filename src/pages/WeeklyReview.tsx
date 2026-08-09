import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useGtdStore } from '../store/useGtdStore'
import type { Project, Task } from '../types'
import { addDays, formatDeferDate, formatDueDate, startOfDay } from '../utils/date'

function StepList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted">{empty}</p>
  }
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex flex-wrap items-center gap-2 text-sm text-ink">
          <span>{task.title}</span>
          {task.waitingOn && (
            <span className="rounded-full bg-pale-yellow px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-pale-yellow-ink">
              waiting on {task.waitingOn}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function WeeklyReview() {
  const tasks = useGtdStore((s) => s.tasks)
  const projects = useGtdStore((s) => s.projects)
  const completeReview = useGtdStore((s) => s.completeReview)

  const [stepIndex, setStepIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const today = startOfDay()

  const inbox = useMemo(() => tasks.filter((t) => t.status === 'inbox'), [tasks])
  const nextActions = useMemo(() => tasks.filter((t) => t.status === 'next'), [tasks])
  const waiting = useMemo(() => tasks.filter((t) => t.status === 'waiting'), [tasks])
  const someday = useMemo(() => tasks.filter((t) => t.status === 'someday'), [tasks])

  // A project with no open next action has nothing pulling it forward — GTD calls
  // this stalled, and catching it is the whole point of the weekly review.
  const stalled = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active')
    return activeProjects
      .map((project: Project) => ({
        project,
        waitingCount: tasks.filter((t) => t.projectId === project.id && t.status === 'waiting')
          .length,
        nextCount: tasks.filter((t) => t.projectId === project.id && t.status === 'next').length,
      }))
      .filter((row) => row.nextCount === 0)
  }, [projects, tasks])

  const upcoming = useMemo(() => {
    const horizon = addDays(today, 7)
    return tasks
      .filter(
        (t) =>
          t.status !== 'completed' &&
          ((t.dueDate !== undefined && t.dueDate <= horizon) ||
            (t.deferUntil !== undefined && t.deferUntil > today && t.deferUntil <= horizon)),
      )
      .sort((a, b) => (a.dueDate ?? a.deferUntil ?? 0) - (b.dueDate ?? b.deferUntil ?? 0))
  }, [tasks, today])

  const steps: { title: string; hint: string; body: ReactNode }[] = [
    {
      title: 'Clear the Inbox',
      hint: 'Process every captured item until nothing is left unclarified.',
      body:
        inbox.length === 0 ? (
          <p className="text-sm text-muted">Inbox is empty. Nothing left to process.</p>
        ) : (
          <div>
            <p className="text-sm text-ink">
              {inbox.length} item{inbox.length === 1 ? '' : 's'} still waiting to be clarified.
            </p>
            <StepList tasks={inbox} empty="" />
            <Link to="/" className="mt-3 inline-block text-xs text-ink underline">
              Go to Inbox
            </Link>
          </div>
        ),
    },
    {
      title: 'Review Next Actions',
      hint: 'Is each one still the real next physical step? Delete or reword what is stale.',
      body: (
        <div>
          <StepList tasks={nextActions} empty="No next actions on the list." />
          <Link to="/next" className="mt-3 inline-block text-xs text-ink underline">
            Go to Next Actions
          </Link>
        </div>
      ),
    },
    {
      title: 'Review Waiting For',
      hint: 'Anyone you need to chase? Anything that quietly arrived already?',
      body: (
        <div>
          <StepList tasks={waiting} empty="Nothing is blocked on anyone else." />
          <Link to="/waiting" className="mt-3 inline-block text-xs text-ink underline">
            Go to Waiting For
          </Link>
        </div>
      ),
    },
    {
      title: 'Review Projects',
      hint: 'Every active project needs at least one next action, or it stalls.',
      body:
        stalled.length === 0 ? (
          <p className="text-sm text-muted">
            Every active project has a next action. Nothing is stalled.
          </p>
        ) : (
          <div>
            <p className="text-sm text-ink">
              {stalled.length} project{stalled.length === 1 ? '' : 's'} with no next action:
            </p>
            <ul className="mt-2 space-y-2">
              {stalled.map(({ project, waitingCount }) => (
                <li
                  key={project.id}
                  className="rounded-lg border border-hairline bg-pale-red px-3 py-2"
                >
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-sm text-pale-red-ink underline"
                  >
                    {project.name}
                  </Link>
                  {waitingCount > 0 && (
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-pale-red-ink">
                      {waitingCount} waiting-for item{waitingCount === 1 ? '' : 's'} — may be fine
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ),
    },
    {
      title: 'Review Someday/Maybe',
      hint: 'Pull anything up that you are ready to start. Drop what you no longer want.',
      body: (
        <div>
          <StepList tasks={someday} empty="Nothing parked here." />
          <Link to="/someday" className="mt-3 inline-block text-xs text-ink underline">
            Go to Someday/Maybe
          </Link>
        </div>
      ),
    },
    {
      title: 'Look ahead',
      hint: 'Anything due or arriving in the next seven days?',
      body:
        upcoming.length === 0 ? (
          <p className="text-sm text-muted">Nothing dated in the next week.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-2 text-sm text-ink">
                <span>{task.title}</span>
                {task.dueDate !== undefined && (
                  <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {formatDueDate(task.dueDate)}
                  </span>
                )}
                {task.deferUntil !== undefined && task.deferUntil > today && (
                  <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {formatDeferDate(task.deferUntil)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ),
    },
  ]

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-16">
        <h2 className="font-serif text-3xl italic tracking-tight text-ink">Review complete</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          All six steps done. Your lists are trustworthy again until next week.
        </p>
        <button
          type="button"
          onClick={() => {
            setStepIndex(0)
            setFinished(false)
          }}
          className="mt-8 rounded-md border border-hairline px-4 py-2 text-sm text-muted hover:border-ink hover:text-ink"
        >
          Run it again
        </button>
      </div>
    )
  }

  const step = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <h2 className="font-serif text-3xl italic tracking-tight text-ink">Weekly Review</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Six steps, one at a time. This is the habit that keeps the rest of the system honest.
      </p>

      <div className="mt-8">
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`h-0.5 flex-1 ${i <= stepIndex ? 'bg-ink' : 'bg-hairline'}`}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-muted">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-hairline bg-surface p-6">
        <h3 className="font-serif text-xl italic text-ink">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{step.hint}</p>
        <div className="mt-5">{step.body}</div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStepIndex((i) => i - 1)}
          disabled={stepIndex === 0}
          className="text-xs font-medium text-muted hover:text-ink disabled:invisible"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (isLast) {
              completeReview()
              setFinished(true)
            } else {
              setStepIndex((i) => i + 1)
            }
          }}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-[background-color,transform] hover:bg-neutral-700 active:scale-[0.98]"
        >
          {isLast ? 'Finish review' : 'Done — next step'}
        </button>
      </div>
    </div>
  )
}

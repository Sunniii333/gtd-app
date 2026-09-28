import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CaptureBar } from '../components/CaptureBar'
import { DataControls } from '../components/DataControls'
import { ItemRow } from '../components/ItemRow'
import { StalledProjectCard } from '../components/StalledProjectCard'
import { Button, SectionTitle } from '../components/ui'
import { isOpen, stalledProjects, visibleNextActions } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'
import { addDays, formatDay, startOfDay } from '../utils/date'

/** Prompts in the spirit of the book's "incompletion trigger list". */
const TRIGGERS = [
  'Promises made to others — boss, team, family, friends',
  'Communications to send: calls, emails, messages, thank-yous',
  'Upcoming events: meetings, trips, birthdays, deadlines',
  'Projects started but not finished, or not yet started',
  'Home: repairs, errands, bills, paperwork, health, car',
  'Money: payments, taxes, budget, insurance, investments',
  'Waiting on anyone? Anything you are expecting to arrive?',
  'Things to learn, read, look into, decide',
]

type Phase = 'Get clear' | 'Get current' | 'Get creative'

interface Step {
  phase: Phase
  title: string
  hint: string
  body: ReactNode
}

const Go = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="mt-3 inline-block text-xs text-ink underline">
    {children}
  </Link>
)

export function WeeklyReview() {
  const items = useGtdStore((s) => s.items)
  const projects = useGtdStore((s) => s.projects)
  const lastReviewAt = useGtdStore((s) => s.lastReviewAt)
  const completeReview = useGtdStore((s) => s.completeReview)
  const reconsider = useGtdStore((s) => s.reconsider)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const today = startOfDay()

  const v = useMemo(() => {
    const data = { items, projects }
    const since = Math.min(lastReviewAt ?? Infinity, addDays(today, -7))
    const calendar = items.filter((i) => i.date !== undefined && (i.status === 'calendar' || i.status === 'done'))
    return {
      inbox: items.filter((i) => i.status === 'inbox'),
      next: visibleNextActions(data),
      pastCalendar: calendar
        .filter((i) => i.date! < today && i.date! >= startOfDay(since))
        .sort((a, b) => a.date! - b.date!),
      upcoming: calendar
        .filter((i) => i.status === 'calendar' && i.date! >= today && i.date! <= addDays(today, 14))
        .sort((a, b) => a.date! - b.date!),
      waiting: items.filter((i) => i.status === 'waiting'),
      stalled: stalledProjects(data),
      active: projects.filter((p) => p.status === 'active'),
      someday: items.filter((i) => i.status === 'someday'),
      somedayProjects: projects.filter((p) => p.status === 'someday'),
      openFor: (id: string) => items.filter((i) => i.projectId === id && isOpen(i)).length,
    }
  }, [items, projects, lastReviewAt, today])

  const steps: Step[] = [
    {
      phase: 'Get clear',
      title: 'Collect loose papers and materials',
      hint: 'Receipts, notes, business cards, screenshots, voice memos, bag and desk. Capture each one.',
      body: <CaptureBar placeholder="Capture each loose item…" />,
    },
    {
      phase: 'Get clear',
      title: 'Get the Inbox to zero',
      hint: 'Clarify every item until nothing is left undecided.',
      body:
        v.inbox.length === 0 ? (
          <p className="text-sm text-muted">Inbox is empty.</p>
        ) : (
          <>
            <p className="text-sm text-ink">
              {v.inbox.length} item{v.inbox.length === 1 ? '' : 's'} still to clarify.
            </p>
            <Go to="/">Go to Inbox and press “Process all” →</Go>
          </>
        ),
    },
    {
      phase: 'Get clear',
      title: 'Empty your head',
      hint: 'Write down anything new that’s on your mind. Use the prompts below to jog your memory.',
      body: (
        <>
          <CaptureBar placeholder="What’s on your mind?" />
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            {TRIGGERS.map((t) => (
              <li key={t}>· {t}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      phase: 'Get current',
      title: 'Review Next Actions lists',
      hint: 'Tick what’s done. Is each one still the real next physical step? ↺ anything that isn’t.',
      body: v.next.length ? (
        <ul>
          {v.next.map((i) => (
            <ItemRow key={i.id} item={i} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No next actions.</p>
      ),
    },
    {
      phase: 'Get current',
      title: 'Review previous calendar',
      hint: 'Anything that happened and left a follow-up? Capture it. Anything that didn’t happen needs a decision.',
      body: (
        <>
          {v.pastCalendar.length ? (
            <ul>
              {v.pastCalendar.map((i) => (
                <ItemRow
                  key={i.id}
                  item={i}
                  extra={
                    i.status === 'calendar' && (
                      <span className="font-mono text-[0.625rem] uppercase text-pale-red-ink">missed</span>
                    )
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No calendar entries since the last review.</p>
          )}
          <div className="mt-4">
            <CaptureBar placeholder="Capture any follow-up…" />
          </div>
        </>
      ),
    },
    {
      phase: 'Get current',
      title: 'Review upcoming calendar',
      hint: 'The next two weeks. Anything to prepare or arrange beforehand? Capture it.',
      body: (
        <>
          {v.upcoming.length ? (
            <ul className="space-y-1.5">
              {v.upcoming.map((i) => (
                <li key={i.id} className="flex gap-3 text-sm">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted">{formatDay(i.date!, today)}</span>
                  <span className="text-ink">{i.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing on the calendar in the next two weeks.</p>
          )}
          <div className="mt-4">
            <CaptureBar placeholder="Capture any preparation…" />
          </div>
        </>
      ),
    },
    {
      phase: 'Get current',
      title: 'Review Waiting For',
      hint: 'Tick what arrived. Anyone to chase? Chasing is a next action — capture it.',
      body: v.waiting.length ? (
        <ul>
          {v.waiting.map((i) => (
            <ItemRow key={i.id} item={i} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nothing pending on others.</p>
      ),
    },
    {
      phase: 'Get current',
      title: 'Review Projects',
      hint: 'Every active project needs at least one action in motion. Fix each stalled one right here.',
      body: (
        <>
          {v.stalled.length > 0 && (
            <ul className="mb-4 space-y-2">
              {v.stalled.map((p) => (
                <StalledProjectCard key={p.id} project={p} />
              ))}
            </ul>
          )}
          {v.active.length === 0 ? (
            <p className="text-sm text-muted">No active projects.</p>
          ) : v.stalled.length === 0 ? (
            <p className="text-sm text-muted">Every active project has something in motion.</p>
          ) : null}
          <ul className="mt-2 space-y-1">
            {v.active
              .filter((p) => !v.stalled.includes(p))
              .map((p) => (
                <li key={p.id} className="flex justify-between gap-3 text-sm">
                  <Link to={`/projects/${p.id}`} className="text-ink hover:underline">
                    {p.name}
                  </Link>
                  <span className="font-mono text-xs text-muted">{v.openFor(p.id)} open</span>
                </li>
              ))}
          </ul>
        </>
      ),
    },
    {
      phase: 'Get current',
      title: 'Review relevant checklists',
      hint: 'Any recurring responsibilities, routines or checklists you keep? Anything there that needs action? Capture it.',
      body: <CaptureBar placeholder="Capture anything a checklist reminds you of…" />,
    },
    {
      phase: 'Get creative',
      title: 'Review Someday/Maybe',
      hint: 'Ready to start any of these? Activate it. No longer interested? Delete it.',
      body: (
        <>
          {v.somedayProjects.length > 0 && (
            <>
              <SectionTitle>Projects on hold</SectionTitle>
              <ul className="mb-2 space-y-1">
                {v.somedayProjects.map((p) => (
                  <li key={p.id} className="text-sm">
                    <Link to={`/projects/${p.id}`} className="text-ink hover:underline">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {v.someday.length ? (
            <ul>
              {v.someday.map((i) => (
                <ItemRow
                  key={i.id}
                  item={i}
                  extra={
                    <Button variant="ghost" onClick={() => reconsider(i.id)}>
                      Activate
                    </Button>
                  }
                />
              ))}
            </ul>
          ) : (
            v.somedayProjects.length === 0 && <p className="text-sm text-muted">Nothing incubating.</p>
          )}
        </>
      ),
    },
    {
      phase: 'Get creative',
      title: 'Be creative and courageous',
      hint: 'Any new, bold or crazy ideas worth capturing? Add them — you can decide later.',
      body: <CaptureBar placeholder="A new idea…" />,
    },
  ]

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-14">
        <h2 className="text-xl font-semibold uppercase tracking-[0.14em] text-ink underline decoration-1 underline-offset-[6px] sm:text-2xl">Review complete</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Clear, current, and creative. Your lists can be trusted again for the week ahead.
        </p>
        {v.inbox.length > 0 && (
          <p className="mt-4 text-sm text-ink">
            {v.inbox.length} item{v.inbox.length === 1 ? '' : 's'} in your Inbox —{' '}
            <Link to="/" className="underline">
              clarify them now
            </Link>
            .
          </p>
        )}
        <Button
          className="mt-8"
          onClick={() => {
            setIndex(0)
            setFinished(false)
          }}
        >
          Start again
        </Button>
      </div>
    )
  }

  const step = steps[index]
  const isLast = index === steps.length - 1
  const phases: Phase[] = ['Get clear', 'Get current', 'Get creative']

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-14">
      <h2 className="text-xl font-semibold uppercase tracking-[0.14em] text-ink underline decoration-1 underline-offset-[6px] sm:text-2xl">Weekly Review</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The habit that keeps the whole system trustworthy. Once a week, step by step.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2">
        {phases.map((phase) => {
          const inPhase = steps.map((s, i) => [s, i] as const).filter(([s]) => s.phase === phase)
          return (
            <div key={phase}>
              <p
                className={`font-mono text-[0.625rem] uppercase tracking-wide ${
                  step.phase === phase ? 'text-ink' : 'text-muted'
                }`}
              >
                {phase}
              </p>
              <div className="mt-1 flex gap-0.5">
                {inPhase.map(([s, i]) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={s.title}
                    className={`h-1 flex-1 rounded-none ${i <= index ? 'bg-ink' : 'bg-hairline'}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 border border-rule bg-surface p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted">
          {index + 1} / {steps.length}
        </p>
        <h3 className="mt-1 text-base font-semibold uppercase tracking-[0.08em] text-ink">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{step.hint}</p>
        <div className="mt-5">{step.body}</div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} className="disabled:invisible">
          ← Back
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (isLast) {
              completeReview()
              setFinished(true)
            } else {
              setIndex((i) => i + 1)
            }
            window.scrollTo({ top: 0 })
          }}
        >
          {isLast ? 'Finish review' : 'Done — next'}
        </Button>
      </div>

      <div className="mt-10 md:hidden">
        <DataControls />
      </div>
    </div>
  )
}

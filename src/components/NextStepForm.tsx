import { useMemo, useState } from 'react'
import { SUGGESTED_CONTEXTS, normalizeContext } from '../domain/gtd'
import { useGtdStore, type NewItem } from '../store/useGtdStore'
import { fromDateInput, startOfDay, toDateInput } from '../utils/date'
import { Button, Pills, inputClass, labelClass } from './ui'

export type StepKind = 'next' | 'waiting' | 'calendar'

const KIND_LABEL: Record<StepKind, string> = {
  next: 'I’ll do it',
  waiting: 'Someone else',
  calendar: 'On a set day',
}

interface NextStepFormProps {
  /** Which ways of handling the action are offered. */
  kinds?: StepKind[]
  initialTitle?: string
  projectId?: string
  submitLabel?: string
  autoFocus?: boolean
  /** Holds the submit back while something outside the form is still missing. */
  blocked?: boolean
  onSubmit: (fields: NewItem) => void
}

/**
 * Answers the book's question "What's the next action?" and where it goes:
 * a context list (do it yourself), Waiting For (delegate) or the calendar (must be that day).
 */
export function NextStepForm({
  kinds = ['next', 'waiting', 'calendar'],
  initialTitle = '',
  projectId,
  submitLabel = 'Save',
  autoFocus,
  blocked = false,
  onSubmit,
}: NextStepFormProps) {
  const items = useGtdStore((s) => s.items)
  const [kind, setKind] = useState<StepKind>(kinds[0])
  const [title, setTitle] = useState(initialTitle)
  const [context, setContext] = useState('')
  const [waitingOn, setWaitingOn] = useState('')
  const [date, setDate] = useState(toDateInput(startOfDay()))
  const [time, setTime] = useState('')

  const contexts = useMemo(() => {
    const used = items.map((i) => i.context).filter((c): c is string => !!c)
    return Array.from(new Set([...SUGGESTED_CONTEXTS, ...used]))
  }, [items])

  const trimmed = title.trim()
  const valid =
    !blocked &&
    trimmed !== '' &&
    (kind !== 'waiting' || waitingOn.trim() !== '') &&
    (kind !== 'calendar' || fromDateInput(date) !== undefined)

  const submit = () => {
    if (!valid) return
    if (kind === 'next') {
      onSubmit({ title: trimmed, status: 'next', context: normalizeContext(context), projectId })
    } else if (kind === 'waiting') {
      onSubmit({ title: trimmed, status: 'waiting', waitingOn: waitingOn.trim(), projectId })
    } else {
      onSubmit({
        title: trimmed,
        status: 'calendar',
        date: fromDateInput(date),
        time: time || undefined,
        projectId,
      })
    }
    setTitle('')
    setWaitingOn('')
    setTime('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="space-y-3"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Start with a verb — Call…, Email…, Draft…, Buy…"
        autoFocus={autoFocus}
        className={inputClass}
      />

      {kinds.length > 1 && (
        <Pills
          options={kinds.map((k) => ({ value: k, label: KIND_LABEL[k] }))}
          value={kind}
          onChange={setKind}
        />
      )}

      {kind === 'next' && (
        <div>
          <p className={labelClass}>Where can you do it?</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {contexts.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContext(context === c ? '' : c)}
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide transition-colors ${
                  normalizeContext(context) === c
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-hairline text-muted hover:border-ink hover:text-ink'
                }`}
              >
                {c}
              </button>
            ))}
            <input
              type="text"
              value={contexts.includes(normalizeContext(context) ?? '') ? '' : context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="@other"
              className="w-24 rounded-full border border-hairline bg-canvas px-2.5 py-0.5 font-mono text-[11px] text-ink focus:border-ink focus:outline-none"
            />
          </div>
        </div>
      )}

      {kind === 'waiting' && (
        <label className={labelClass}>
          Waiting on whom?
          <input
            type="text"
            value={waitingOn}
            onChange={(e) => setWaitingOn(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
      )}

      {kind === 'calendar' && (
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Day it must happen
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className={labelClass}>
            Time (optional)
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <p className="col-span-2 text-xs leading-relaxed text-muted">
            Only if it truly must happen that day. Otherwise it belongs on a Next Actions list.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={!valid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

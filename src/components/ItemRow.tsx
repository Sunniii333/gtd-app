import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isOpen } from '../domain/gtd'
import type { Item } from '../types'
import { useGtdStore } from '../store/useGtdStore'
import { formatAge, formatDay } from '../utils/date'
import { EditButton, EditForm } from './EditForm'
import { chipClass } from './ui'

interface ItemRowProps {
  item: Item
  /** Show the project chip (off on the project's own page). */
  showProject?: boolean
  showContext?: boolean
  showDate?: boolean
  extra?: ReactNode
}

export function ItemRow({ item, showProject = true, showContext = true, showDate = true, extra }: ItemRowProps) {
  const project = useGtdStore((s) =>
    item.projectId ? s.projects.find((p) => p.id === item.projectId) : undefined,
  )
  const completeItem = useGtdStore((s) => s.completeItem)
  const deleteItem = useGtdStore((s) => s.deleteItem)
  const reconsider = useGtdStore((s) => s.reconsider)
  const editItem = useGtdStore((s) => s.editItem)
  const [editing, setEditing] = useState(false)
  const done = item.status === 'done'

  if (editing) {
    return (
      <li className="step flex border-b border-dashed border-hairline py-3.5 last:border-0">
        <EditForm
          title={item.title}
          notes={item.notes}
          withNotes
          onSave={(text) => {
            editItem(item.id, text)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className="step group flex items-start gap-3 border-b border-dashed border-hairline py-3.5 last:border-0">
      {isOpen(item) || done ? (
        <input
          type="checkbox"
          checked={done}
          disabled={done}
          onChange={() => completeItem(item.id)}
          aria-label={`Complete ${item.title}`}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <span className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 border border-dashed border-hairline" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${done ? 'text-muted line-through' : 'text-ink'}`}>
          {item.status === 'calendar' && item.time && (
            <span className="mr-2 font-mono text-xs text-muted">{item.time}</span>
          )}
          {item.title}
        </p>
        {item.notes && <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted">{item.notes}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 empty:hidden">
          {showProject && project && (
            <Link to={`/projects/${project.id}`} className={`${chipClass} hover:text-ink`}>
              {project.name}
            </Link>
          )}
          {showContext && item.status === 'next' && item.context && (
            <span className={chipClass}>{item.context}</span>
          )}
          {item.status === 'waiting' && (
            <span className="rounded-none bg-pale-yellow border border-pale-yellow-ink/40 px-1.5 py-px font-mono text-[0.625rem] uppercase tracking-[0.08em] text-pale-yellow-ink">
              {item.waitingOn}
              {item.waitingSince !== undefined && ` · ${formatAge(item.waitingSince)}`}
            </span>
          )}
          {item.status === 'calendar' && item.date !== undefined && showDate && (
            <span className={chipClass}>{formatDay(item.date)}</span>
          )}
          {item.status === 'someday' && item.ticklerDate !== undefined && (
            <span className={chipClass}>back on {formatDay(item.ticklerDate)}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {extra}
        {!done && <EditButton onClick={() => setEditing(true)} />}
        {!done && item.status !== 'inbox' && (
          <button
            type="button"
            onClick={() => reconsider(item.id)}
            title="Send back to the Inbox to clarify again"
            aria-label="Clarify again"
            className="px-2 py-1 text-sm text-muted opacity-60 hover:text-ink group-hover:opacity-100"
          >
            ↺
          </button>
        )}
        <button
          type="button"
          onClick={() => deleteItem(item.id)}
          aria-label="Delete"
          className="px-2 py-1 text-sm text-muted opacity-60 hover:text-pale-red-ink group-hover:opacity-100"
        >
          ×
        </button>
      </div>
    </li>
  )
}

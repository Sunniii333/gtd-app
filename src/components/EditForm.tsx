import { useState } from 'react'
import { Button, inputClass, rowActionClass } from './ui'

interface EditFormProps {
  title: string
  notes?: string
  /** Items have notes; a project's name does not. */
  withNotes?: boolean
  onSave: (text: { title: string; notes?: string }) => void
  onCancel: () => void
}

/** Edit: fix the wording in place. Escape cancels; a blank title can't be saved. */
export function EditForm({ title: initialTitle, notes: initialNotes, withNotes = false, onSave, onCancel }: EditFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [notes, setNotes] = useState(initialNotes ?? '')

  return (
    <form
      className="flex-1 space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (title.trim()) onSave({ title, notes })
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel()
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Title"
        className={inputClass}
      />
      {withNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          aria-label="Notes"
          placeholder="Notes"
          className={inputClass}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!title.trim()}>
          Save
        </Button>
      </div>
    </form>
  )
}

/** The ✎ button that opens an EditForm, styled like the row's other quiet actions. */
export function EditButton({ onClick, label = 'Edit' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Fix the wording"
      aria-label={label}
      className={`${rowActionClass} hover:text-ink`}
    >
      ✎
    </button>
  )
}

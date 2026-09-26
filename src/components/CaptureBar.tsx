import { useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'

/** Capture is ubiquitous in GTD: this box sits on every screen and drops straight into the Inbox. */
export function CaptureBar({ placeholder = 'Capture anything on your mind…' }: { placeholder?: string }) {
  const [value, setValue] = useState('')
  const [flash, setFlash] = useState(false)
  const capture = useGtdStore((s) => s.capture)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const title = value.trim()
        if (!title) return
        capture(title)
        setValue('')
        setFlash(true)
        window.setTimeout(() => setFlash(false), 900)
      }}
      className="relative"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Capture to Inbox"
        className={`w-full rounded-md border bg-canvas py-2 pl-3 pr-14 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none ${
          flash ? 'border-ink' : 'border-hairline'
        }`}
      />
      <button
        type="submit"
        className="absolute right-1 top-1 bottom-1 rounded px-2.5 font-mono text-[11px] uppercase tracking-wide text-muted hover:text-ink"
      >
        {flash ? '✓' : 'Add'}
      </button>
    </form>
  )
}

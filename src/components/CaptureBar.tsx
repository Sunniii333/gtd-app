import { useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'

/** Inline capture for the Weekly Review's mind-sweep steps; everywhere else uses CaptureButton. */
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
        className={`w-full border-[1.5px] bg-surface py-2.5 pl-3 pr-16 text-sm text-ink placeholder:text-muted focus:border-rule focus:outline-none ${
          flash ? 'border-rule' : 'border-hairline'
        }`}
      />
      <button
        type="submit"
        className="absolute right-0 top-0 bottom-0 border-l-[1.5px] border-rule bg-ink px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-canvas"
      >
        {flash ? '✓' : 'Log'}
      </button>
    </form>
  )
}

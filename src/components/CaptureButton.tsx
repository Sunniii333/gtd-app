import { useEffect, useRef, useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { Modal } from './ui'

/**
 * Capture is ubiquitous in GTD. One unmistakable button opens a capture sheet:
 * type, Enter, type the next thing — empty your head without leaving the sheet.
 */
export function CaptureButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Capture to Inbox"
        className={`flex items-center justify-center gap-2 border-[1.5px] border-rule bg-ink font-mono text-xs font-semibold uppercase tracking-[0.16em] text-canvas shadow-[3px_3px_0_var(--color-pale-red-ink)] transition-transform active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--color-pale-red-ink)] ${className}`}
      >
        <span className="text-lg leading-none">＋</span> Capture
      </button>
      {open && <CaptureSheet onClose={() => setOpen(false)} />}
    </>
  )
}

function CaptureSheet({ onClose }: { onClose: () => void }) {
  const capture = useGtdStore((s) => s.capture)
  const [value, setValue] = useState('')
  const [log, setLog] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b border-rule pb-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
        <span className="text-ink">Capture → Inbox</span>
        <span>{log.length} logged</span>
      </div>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault()
          const title = value.trim()
          if (!title) return
          capture(title)
          setLog((l) => [title, ...l])
          setValue('')
          inputRef.current?.focus()
        }}
      >
        <label htmlFor="capture-input" className="block text-xs text-muted">
          What’s on your mind? Enter to log it, then keep going.
        </label>
        <div className="mt-2 flex items-stretch border-[1.5px] border-rule bg-surface">
          <span className="flex items-center pl-3 font-mono text-sm text-muted" aria-hidden>
            &gt;
          </span>
          <input
            id="capture-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            enterKeyHint="send"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-ink placeholder:text-muted focus:outline-none"
            placeholder="Call dentist about…"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="border-l-[1.5px] border-rule bg-ink px-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-canvas disabled:opacity-40"
          >
            Log
          </button>
        </div>
      </form>

      {log.length > 0 && (
        <ul className="mt-4 space-y-1 font-mono text-xs text-muted">
          {log.map((t, i) => (
            <li key={`${i}-${t}`} className="flex gap-2">
              <span className="text-ink">✓</span>
              <span className="truncate">{t}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex justify-end border-t border-dashed border-hairline pt-3">
        <button
          type="button"
          onClick={onClose}
          className="border border-rule px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-canvas"
        >
          Done
        </button>
      </div>
    </Modal>
  )
}

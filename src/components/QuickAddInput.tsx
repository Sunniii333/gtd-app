import { useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'

export function QuickAddInput() {
  const [value, setValue] = useState('')
  const addTask = useGtdStore((s) => s.addTask)

  const submit = () => {
    const title = value.trim()
    if (!title) return
    addTask(title)
    setValue('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Capture a thought..."
        className="flex-1 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-[background-color,transform] hover:bg-neutral-700 active:scale-[0.98]"
      >
        Add
      </button>
    </form>
  )
}

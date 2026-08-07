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
        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="submit"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        Add
      </button>
    </form>
  )
}

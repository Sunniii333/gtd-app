import { useRef, useState } from 'react'
import { useGtdStore } from '../store/useGtdStore'
import { downloadBackup, parseBackup } from '../utils/backup'

export function DataControls() {
  const fileRef = useRef<HTMLInputElement>(null)
  const exportData = useGtdStore((s) => s.exportData)
  const importData = useGtdStore((s) => s.importData)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    try {
      const backup = parseBackup(await file.text())
      const confirmed = window.confirm(
        `Replace all current data with this backup?\n\n` +
          `${backup.tasks.length} tasks, ${backup.projects.length} projects.\n` +
          `This cannot be undone.`,
      )
      if (confirmed) importData(backup)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.')
    }
  }

  return (
    <div className="mt-8 border-t border-hairline px-4 pt-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Data</p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => downloadBackup(exportData())}
          className="text-xs text-muted hover:text-ink"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs text-muted hover:text-ink"
        >
          Import
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-pale-red-ink">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

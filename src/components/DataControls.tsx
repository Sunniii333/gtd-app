import { useRef, useState } from 'react'
import { parseBackup } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'
import { downloadBackup } from '../utils/backup'
import { startOfDay } from '../utils/date'
import { isUnsynced } from '../sync/cloud'

/** Quiet note while this Device has changes the Cloud copy hasn't got; nothing when all is synced. */
export function SyncNote({ className = '' }: { className?: string }) {
  const status = useGtdStore((s) => s.syncStatus)
  if (!isUnsynced(status)) return null
  return <span className={`text-muted ${className}`}>○ {status === 'offline' ? 'offline' : 'not synced yet'}</span>
}

export function DataControls() {
  const fileRef = useRef<HTMLInputElement>(null)
  const exportData = useGtdStore((s) => s.exportData)
  const importData = useGtdStore((s) => s.importData)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    try {
      const backup = parseBackup(await file.text(), startOfDay())
      const confirmed = window.confirm(
        `Replace all data on every device with this backup?\n\n` +
          `${backup.items.length} items, ${backup.projects.length} projects.\n` +
          `This cannot be undone.`,
      )
      if (confirmed) importData(backup)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.')
    }
  }

  return (
    <div className="mt-3">
      <div className="flex gap-3">
        <button type="button" onClick={() => downloadBackup(exportData())} className="border border-hairline px-2 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted hover:border-rule hover:text-ink">
          Export
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="border border-hairline px-2 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted hover:border-rule hover:text-ink">
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

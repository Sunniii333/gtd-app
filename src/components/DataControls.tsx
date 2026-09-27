import { useRef, useState } from 'react'
import { parseBackup } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'
import { downloadBackup } from '../utils/backup'
import { startOfDay } from '../utils/date'

export function DataControls() {
  const fileRef = useRef<HTMLInputElement>(null)
  const exportData = useGtdStore((s) => s.exportData)
  const importData = useGtdStore((s) => s.importData)
  const syncStatus = useGtdStore((s) => s.syncStatus)
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
    <div className="mt-8 border-t border-dashed border-hairline pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Backup
        {syncStatus && syncStatus !== 'synced' && (
          <span className="ml-2 text-pale-red-ink">● {syncStatus === 'offline' ? 'offline' : 'not synced yet'}</span>
        )}
      </p>
      <div className="mt-2 flex gap-3">
        <button type="button" onClick={() => downloadBackup(exportData())} className="border border-hairline px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted hover:border-rule hover:text-ink">
          Export
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="border border-hairline px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted hover:border-rule hover:text-ink">
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

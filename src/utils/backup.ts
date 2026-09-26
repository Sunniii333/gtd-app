import type { GtdData } from '../types'

export function downloadBackup(data: GtdData) {
  const now = new Date()
  const backup = { version: 2, exportedAt: now.getTime(), ...data }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gtd-backup-${now.toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

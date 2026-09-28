import { useState, type ReactNode } from 'react'
import { DataControls } from '../components/DataControls'
import { Button, Page, Pills, SectionTitle, labelClass } from '../components/ui'
import { useSettings } from '../settings/useSettings'
import type { TextSize, Theme } from '../settings/settings'
import { useGtdStore } from '../store/useGtdStore'
import { isUnsynced, signOutDevice } from '../sync/cloud'
import { auth } from '../sync/firebase'

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'paper', label: 'Paper' },
  { value: 'carbon', label: 'Carbon' },
]

const TEXT_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
]

function Row({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <li className="step flex border-b border-dashed border-hairline py-4">
      <div className="flex-1">
        <p className={labelClass}>{label}</p>
        <p className="mt-1 text-xs text-muted">{hint}</p>
        <div className="mt-3">{children}</div>
      </div>
    </li>
  )
}

export function Settings() {
  const { theme, textSize, reduceMotion, update } = useSettings()
  const syncStatus = useGtdStore((s) => s.syncStatus)
  const [error, setError] = useState<string | null>(null)
  const email = auth.currentUser?.email

  const signOut = () => {
    const warning = isUnsynced(syncStatus)
      ? `This device has changes that haven't reached the cloud yet (${syncStatus}).\nSigning out now may lose them.\n\n`
      : ''
    if (!window.confirm(`${warning}Sign out and clear this device's copy?\nYour data stays in the cloud.`)) return
    signOutDevice().catch((e: Error) => setError(e.message))
  }

  return (
    <Page title="Settings" subtitle="Appearance is kept per device and never syncs — your phone can be Carbon while the desktop stays Paper.">
      <SectionTitle>Appearance</SectionTitle>
      <ul>
        <Row label="Theme" hint="Paper is the cream sheet, Carbon the dark copy. System follows this device.">
          <Pills options={THEME_OPTIONS} value={theme} onChange={(v) => update({ theme: v })} />
        </Row>
        <Row label="Text size" hint="Scales every word in the app.">
          <Pills options={TEXT_OPTIONS} value={textSize} onChange={(v) => update({ textSize: v })} />
        </Row>
        <Row label="Reduce motion" hint="No sliding or ticking animations, whatever the device says.">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={reduceMotion} onChange={(e) => update({ reduceMotion: e.target.checked })} />
            <span>{reduceMotion ? 'On' : 'Off'}</span>
          </label>
        </Row>
      </ul>

      <SectionTitle>Account</SectionTitle>
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <div>
          <p className={labelClass}>Signed in as</p>
          <p className="mt-1 break-all text-sm">{email ?? '—'}</p>
        </div>
        <Button onClick={signOut}>Sign out</Button>
      </div>
      {error && <p className="mt-2 text-xs text-pale-red-ink">{error}</p>}

      <SectionTitle>Backup</SectionTitle>
      <p className="text-xs text-muted">A JSON file of everything. Import replaces the data on every device.</p>
      <DataControls />
    </Page>
  )
}

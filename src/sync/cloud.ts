import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { useGtdStore } from '../store/useGtdStore'
import type { Item, Project } from '../types'
import { db } from './firebase'
import { diffRecords } from './diff'

export type SyncStatus = 'offline' | 'pending' | 'synced'

type Key = 'items' | 'projects'
const KEYS: Key[] = ['items', 'projects']

/**
 * Mirrors the store to users/{uid} in Firestore: local changes go up record by record,
 * remote snapshots replace the store. Last write wins by arrival order (ADR 0001).
 * Returns the unsubscribe function.
 */
export function startSync(uid: string): () => void {
  const user = doc(db, 'users', uid)
  const cols = { items: collection(user, 'items'), projects: collection(user, 'projects') }

  // What the Cloud copy is known to hold; local changes are diffed against it.
  const synced: { items: Item[]; projects: Project[]; lastReviewAt: number | undefined } = {
    items: useGtdStore.getState().items,
    projects: useGtdStore.getState().projects,
    lastReviewAt: useGtdStore.getState().lastReviewAt,
  }
  const ready = { items: false, projects: false, meta: false }
  const pending = { items: false, projects: false, meta: false }
  let applying = false

  const fail = (e: unknown) => console.error('sync write failed', e)
  const report = () => {
    const status: SyncStatus = !navigator.onLine
      ? 'offline'
      : Object.values(pending).some(Boolean)
        ? 'pending'
        : 'synced'
    if (useGtdStore.getState().syncStatus !== status) useGtdStore.setState({ syncStatus: status })
  }

  const push = (key: Key, next: (Item | Project)[]) => {
    const { upserts, deletes } = diffRecords<Item | Project>(synced[key], next)
    for (const r of upserts) setDoc(doc(cols[key], r.id), r).catch(fail)
    for (const id of deletes) deleteDoc(doc(cols[key], id)).catch(fail)
    synced[key] = next as never
  }
  const pushMeta = (lastReviewAt: number | undefined) => {
    if (lastReviewAt !== undefined) setDoc(user, { lastReviewAt }, { merge: true }).catch(fail)
    synced.lastReviewAt = lastReviewAt
  }

  const apply = (patch: Partial<typeof synced>) => {
    Object.assign(synced, patch)
    applying = true
    useGtdStore.setState(patch)
    applying = false
  }

  const unsubStore = useGtdStore.subscribe((s) => {
    if (applying) return
    for (const key of KEYS) if (ready[key] && s[key] !== synced[key]) push(key, s[key])
    if (ready.meta && s.lastReviewAt !== synced.lastReviewAt) pushMeta(s.lastReviewAt)
  })

  const unsubs = KEYS.map((key) =>
    onSnapshot(cols[key], { includeMetadataChanges: true }, (snap) => {
      pending[key] = snap.metadata.hasPendingWrites
      report()
      if (!ready[key]) {
        // An empty cache says nothing about the cloud; wait for the server before deciding.
        if (snap.empty && snap.metadata.fromCache) return
        ready[key] = true
        if (snap.empty) {
          // First Device to sign in seeds the empty Cloud copy with what it has locally.
          synced[key] = []
          push(key, useGtdStore.getState()[key])
          return
        }
      } else if (snap.docChanges().length === 0) return
      apply({ [key]: snap.docs.map((d) => d.data()) })
    }),
  )

  const unsubMeta = onSnapshot(user, { includeMetadataChanges: true }, (snap) => {
    pending.meta = snap.metadata.hasPendingWrites
    report()
    if (!ready.meta) {
      if (!snap.exists() && snap.metadata.fromCache) return
      ready.meta = true
      if (!snap.exists()) return pushMeta(useGtdStore.getState().lastReviewAt)
    }
    const lastReviewAt = snap.get('lastReviewAt') as number | undefined
    if (lastReviewAt !== synced.lastReviewAt) apply({ lastReviewAt })
  })

  window.addEventListener('online', report)
  window.addEventListener('offline', report)
  report()

  return () => {
    unsubStore()
    unsubs.forEach((u) => u())
    unsubMeta()
    window.removeEventListener('online', report)
    window.removeEventListener('offline', report)
  }
}

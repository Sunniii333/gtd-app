import { collection, deleteDoc, deleteField, doc, onSnapshot, setDoc, type QuerySnapshot } from 'firebase/firestore'
import { useGtdStore, type Persisted } from '../store/useGtdStore'
import type { Item, Project, SyncStatus } from '../types'
import { db } from './firebase'
import { diffRecords } from './diff'

type Collection = 'items' | 'projects'
const COLLECTIONS: Collection[] = ['items', 'projects']

export const isUnsynced = (s: SyncStatus) => s === 'offline' || s === 'pending'

/**
 * Mirrors the store to users/{uid} in Firestore: local changes go up record by record,
 * remote snapshots replace the store. Last write wins by arrival order (ADR 0001).
 * The users/{uid} doc exists once the Cloud copy has been seeded. Returns the unsubscribe function.
 */
export function startSync(uid: string): () => void {
  const user = doc(db, 'users', uid)
  const cols = { items: collection(user, 'items'), projects: collection(user, 'projects') }

  // What the Cloud copy is known to hold; local changes are diffed against it.
  const { items, projects, lastReviewAt } = useGtdStore.getState()
  const synced: Persisted = { items, projects, lastReviewAt }
  const latest: Partial<Record<Collection, QuerySnapshot>> = {}
  const ready = { items: false, projects: false }
  const pending = { items: false, projects: false, user: false }
  let seeded = false
  let applying = false

  const fail = (e: unknown) => console.error('sync write failed', e)
  const publishStatus = () => {
    const status: SyncStatus = !navigator.onLine ? 'offline' : Object.values(pending).some(Boolean) ? 'pending' : 'synced'
    if (useGtdStore.getState().syncStatus !== status) useGtdStore.setState({ syncStatus: status })
  }

  const pushRecords = (key: Collection, next: (Item | Project)[]) => {
    const { upserts, deletes } = diffRecords<Item | Project>(synced[key], next)
    for (const r of upserts) setDoc(doc(cols[key], r.id), r).catch(fail)
    for (const id of deletes) deleteDoc(doc(cols[key], id)).catch(fail)
    synced[key] = next as never
  }
  const pushReview = (value: number | undefined) => {
    setDoc(user, { lastReviewAt: value ?? deleteField() }, { merge: true }).catch(fail)
    synced.lastReviewAt = value
  }

  const applyRemote = (patch: Partial<Persisted>) => {
    Object.assign(synced, patch)
    applying = true
    useGtdStore.setState(patch)
    applying = false
  }
  const applyCollection = (key: Collection) => {
    const snap = latest[key]
    if (!seeded || !snap || (ready[key] && snap.docChanges().length === 0)) return
    ready[key] = true
    applyRemote({ [key]: snap.docs.map((d) => d.data()) })
  }

  const unsubStore = useGtdStore.subscribe((s) => {
    if (applying) return
    for (const key of COLLECTIONS) if (ready[key] && s[key] !== synced[key]) pushRecords(key, s[key])
    if (seeded && s.lastReviewAt !== synced.lastReviewAt) pushReview(s.lastReviewAt)
  })

  const unsubCols = COLLECTIONS.map((key) =>
    onSnapshot(cols[key], { includeMetadataChanges: true }, (snap) => {
      latest[key] = snap
      pending[key] = snap.metadata.hasPendingWrites
      publishStatus()
      applyCollection(key)
    }),
  )

  const unsubUser = onSnapshot(user, { includeMetadataChanges: true }, (snap) => {
    pending.user = snap.metadata.hasPendingWrites
    publishStatus()
    if (!snap.exists()) {
      // A missing doc in the cache says nothing about the cloud; only the server can say it was never seeded.
      // ponytail: a brand-new Device must be online once; edits made before that are replaced by the Cloud copy.
      if (snap.metadata.fromCache || seeded) return
      // First Device to sign in seeds the empty Cloud copy with everything it has locally.
      const s = useGtdStore.getState()
      synced.items = []
      synced.projects = []
      pushRecords('items', s.items)
      pushRecords('projects', s.projects)
      setDoc(user, { seededAt: Date.now(), lastReviewAt: s.lastReviewAt }).catch(fail)
      return
    }
    seeded = true
    const remoteReview = snap.get('lastReviewAt') as number | undefined
    if (remoteReview !== synced.lastReviewAt) applyRemote({ lastReviewAt: remoteReview })
    COLLECTIONS.forEach(applyCollection)
  })

  window.addEventListener('online', publishStatus)
  window.addEventListener('offline', publishStatus)
  publishStatus()

  return () => {
    unsubStore()
    unsubCols.forEach((u) => u())
    unsubUser()
    window.removeEventListener('online', publishStatus)
    window.removeEventListener('offline', publishStatus)
    useGtdStore.setState({ syncStatus: 'idle' })
  }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGtdStore } from '../store/useGtdStore'
import type { Item } from '../types'


type Snap = { empty?: boolean; exists?: () => boolean; get?: () => unknown; docs?: { data: () => unknown }[]; metadata: { fromCache: boolean; hasPendingWrites: boolean }; docChanges?: () => unknown[] }
const listeners = new Map<string, (s: Snap) => void>()
const writes: string[] = []

const signedOut: string[] = []
vi.mock('./firebase', () => ({ db: {}, auth: {} }))
vi.mock('firebase/auth', () => ({ signOut: () => (signedOut.push('out'), Promise.resolve()) }))
vi.mock('firebase/firestore', () => ({
  doc: (parent: { path?: string } | object, ...segs: string[]) => ({ path: [(parent as { path?: string }).path, ...segs].filter(Boolean).join('/') }),
  collection: (parent: { path: string }, name: string) => ({ path: `${parent.path}/${name}` }),
  setDoc: (ref: { path: string }) => (writes.push(`set ${ref.path}`), Promise.resolve()),
  deleteField: () => 'DELETE',
  deleteDoc: (ref: { path: string }) => (writes.push(`del ${ref.path}`), Promise.resolve()),
  onSnapshot: (ref: { path: string }, _opts: unknown, cb: (s: Snap) => void) => (listeners.set(ref.path, cb), () => {}),
}))

vi.stubGlobal('window', new EventTarget())
vi.stubGlobal('navigator', { onLine: true })

const { signOutDevice, startSync } = await import('./cloud')

const item = (id: string): Item => ({ id, title: id, status: 'inbox', createdAt: 1, updatedAt: 1 })
const server = { fromCache: false, hasPendingWrites: false }
const emptyCol: Snap = { empty: true, docs: [], metadata: server, docChanges: () => [] }
const col = (items: Item[], meta = server): Snap => ({
  empty: items.length === 0,
  docs: items.map((i) => ({ data: () => i })),
  metadata: meta,
  docChanges: () => [{}],
})
const noUser: Snap = { exists: () => false, metadata: server }

let stop = () => {}
afterEach(() => stop())

beforeEach(() => {
  listeners.clear()
  writes.length = 0
  useGtdStore.setState({ items: [], projects: [], lastReviewAt: undefined })
})

const cached = { fromCache: true, hasPendingWrites: false }
const userDoc = (lastReviewAt?: number): Snap => ({ exists: () => true, get: () => lastReviewAt, metadata: server })

describe('startSync', () => {
  it('seeds an empty Cloud copy from all local data', () => {
    useGtdStore.setState({ items: [item('a')], projects: [], lastReviewAt: 3 })
    stop = startSync('u')
    listeners.get('users/u')!(noUser)
    expect(writes).toEqual(['set users/u/items/a', 'set users/u'])
  })

  it('does not seed from an empty cache', () => {
    useGtdStore.setState({ items: [item('a')] })
    stop = startSync('u')
    listeners.get('users/u')!({ ...noUser, metadata: cached })
    expect(writes).toEqual([])
  })

  it('takes the whole Cloud copy once seeded, even an empty collection, without echoing', () => {
    useGtdStore.setState({ items: [item('local')], projects: [{ id: 'p', name: 'p', status: 'active', createdAt: 1 }] })
    stop = startSync('u')
    listeners.get('users/u/items')!(col([item('remote')]))
    listeners.get('users/u/projects')!(emptyCol)
    expect(useGtdStore.getState().items.map((i) => i.id)).toEqual(['local'])
    listeners.get('users/u')!(userDoc())
    expect(useGtdStore.getState().items.map((i) => i.id)).toEqual(['remote'])
    expect(useGtdStore.getState().projects).toEqual([])
    expect(writes).toEqual([])
  })

  it('pushes local edits, deletes and review changes once ready', () => {
    stop = startSync('u')
    listeners.get('users/u/items')!(col([item('a'), item('b')]))
    listeners.get('users/u/projects')!(emptyCol)
    listeners.get('users/u')!(userDoc(1))
    const [a] = useGtdStore.getState().items
    useGtdStore.setState({ items: [{ ...a, title: 'new' }], lastReviewAt: 5 })
    expect(writes).toEqual(['set users/u/items/a', 'del users/u/items/b', 'set users/u'])
  })

  it('reports offline and pending writes', () => {
    stop = startSync('u')
    listeners.get('users/u/items')!(col([], { fromCache: false, hasPendingWrites: true }))
    expect(useGtdStore.getState().syncStatus).toBe('pending')
  })
})

describe('signOutDevice', () => {
  it("empties this Device's copy without touching the Cloud copy", async () => {
    stop = startSync('u')
    listeners.get('users/u/items')!(col([item('a')]))
    listeners.get('users/u/projects')!(emptyCol)
    listeners.get('users/u')!(userDoc(1))
    await signOutDevice()
    expect(useGtdStore.getState().items).toEqual([])
    expect(useGtdStore.getState().lastReviewAt).toBeUndefined()
    expect(writes).toEqual([])
    expect(signedOut).toEqual(['out'])
  })
})

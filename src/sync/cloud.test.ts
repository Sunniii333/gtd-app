import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGtdStore } from '../store/useGtdStore'
import type { Item } from '../types'

type Snap = { empty?: boolean; exists?: () => boolean; get?: () => unknown; docs?: { data: () => unknown }[]; metadata: { fromCache: boolean; hasPendingWrites: boolean }; docChanges?: () => unknown[] }
const listeners = new Map<string, (s: Snap) => void>()
const writes: string[] = []

vi.mock('./firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  doc: (parent: { path?: string } | object, ...segs: string[]) => ({ path: [(parent as { path?: string }).path, ...segs].filter(Boolean).join('/') }),
  collection: (parent: { path: string }, name: string) => ({ path: `${parent.path}/${name}` }),
  setDoc: (ref: { path: string }) => (writes.push(`set ${ref.path}`), Promise.resolve()),
  deleteDoc: (ref: { path: string }) => (writes.push(`del ${ref.path}`), Promise.resolve()),
  onSnapshot: (ref: { path: string }, _opts: unknown, cb: (s: Snap) => void) => (listeners.set(ref.path, cb), () => {}),
}))

vi.stubGlobal('window', new EventTarget())
vi.stubGlobal('navigator', { onLine: true })

const { startSync } = await import('./cloud')

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

describe('startSync', () => {
  it('seeds an empty Cloud copy from the local data', () => {
    useGtdStore.setState({ items: [item('a')] })
    stop = startSync('u')
    listeners.get('users/u/items')!(emptyCol)
    expect(writes).toEqual(['set users/u/items/a'])
  })

  it('waits for the server when the cache is empty', () => {
    useGtdStore.setState({ items: [item('a')] })
    stop = startSync('u')
    listeners.get('users/u/items')!({ ...emptyCol, metadata: { fromCache: true, hasPendingWrites: false } })
    expect(writes).toEqual([])
  })

  it('replaces local data with the cloud, without echoing it back', () => {
    useGtdStore.setState({ items: [item('local')] })
    stop = startSync('u')
    listeners.get('users/u/items')!(col([item('remote')]))
    expect(useGtdStore.getState().items.map((i) => i.id)).toEqual(['remote'])
    expect(writes).toEqual([])
  })

  it('pushes local edits and deletes once ready', () => {
    stop = startSync('u')
    listeners.get('users/u/items')!(col([item('a'), item('b')]))
    listeners.get('users/u')!(noUser)
    const [a] = useGtdStore.getState().items
    useGtdStore.setState({ items: [{ ...a, title: 'new' }], lastReviewAt: 5 })
    expect(writes).toEqual(['set users/u/items/a', 'del users/u/items/b', 'set users/u'])
  })
})

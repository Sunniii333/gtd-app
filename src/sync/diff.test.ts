import { describe, expect, it } from 'vitest'
import type { Item, Project } from '../types'
import { diffRecords } from './diff'

const item = (id: string, title = id): Item => ({ id, title, status: 'inbox', createdAt: 1, updatedAt: 1 })
const project = (id: string): Project => ({ id, name: id, status: 'active', createdAt: 1 })

describe('diffRecords', () => {
  it('reports nothing when the arrays hold the same objects', () => {
    const a = item('a')
    expect(diffRecords([a], [a])).toEqual({ upserts: [], deletes: [] })
  })

  it('upserts added and changed records, by reference', () => {
    const a = item('a')
    const b = item('b')
    const changed = { ...a, title: 'new' }
    expect(diffRecords([a], [changed, b])).toEqual({ upserts: [changed, b], deletes: [] })
  })

  it('deletes records that disappeared', () => {
    const [p, q] = [project('p'), project('q')]
    expect(diffRecords([p, q], [q])).toEqual({ upserts: [], deletes: ['p'] })
  })
})

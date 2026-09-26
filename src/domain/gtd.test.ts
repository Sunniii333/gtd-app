import { describe, expect, it } from 'vitest'
import type { GtdData, Item, Project } from '../types'
import {
  completeItem,
  completeProject,
  deleteItem,
  migrateV1,
  normalizeContext,
  openItemsForProject,
  parseBackup,
  releaseTickler,
  stalledProjects,
  visibleNextActions,
} from './gtd'

const DAY = 86_400_000
const TODAY = new Date(2026, 8, 26).getTime()

function item(patch: Partial<Item>): Item {
  return { id: 'i', title: 't', status: 'next', createdAt: 0, updatedAt: 0, ...patch }
}
function project(patch: Partial<Project>): Project {
  return { id: 'p', name: 'P', status: 'active', createdAt: 0, ...patch }
}

describe('stalled projects', () => {
  it('flags an active project with no open item', () => {
    const data: GtdData = {
      projects: [project({ id: 'p1' }), project({ id: 'p2' })],
      items: [item({ id: 'a', projectId: 'p1', status: 'done' }), item({ id: 'b', projectId: 'p2' })],
    }
    expect(stalledProjects(data).map((p) => p.id)).toEqual(['p1'])
  })

  it('counts calendar and waiting-for items as movement, per the book', () => {
    const data: GtdData = {
      projects: [project({ id: 'p1' }), project({ id: 'p2' })],
      items: [
        item({ id: 'a', projectId: 'p1', status: 'waiting' }),
        item({ id: 'b', projectId: 'p2', status: 'calendar', date: TODAY }),
      ],
    }
    expect(stalledProjects(data)).toEqual([])
    expect(openItemsForProject(data, 'p1')).toHaveLength(1)
  })

  it('ignores someday and done projects', () => {
    const data: GtdData = {
      projects: [project({ id: 'p1', status: 'someday' }), project({ id: 'p2', status: 'done' })],
      items: [],
    }
    expect(stalledProjects(data)).toEqual([])
  })
})

describe('completing an item asks what is next for its project', () => {
  const base: GtdData = {
    projects: [project({ id: 'p1' })],
    items: [item({ id: 'a', projectId: 'p1' }), item({ id: 'b' })],
  }

  it('returns the project to follow up on', () => {
    const { data, followUpProjectId } = completeItem(base, 'a', 5)
    expect(followUpProjectId).toBe('p1')
    expect(data.items[0]).toMatchObject({ status: 'done', completedAt: 5 })
  })

  it('asks even when the project still has other open items', () => {
    const withMore = { ...base, items: [...base.items, item({ id: 'c', projectId: 'p1' })] }
    expect(completeItem(withMore, 'a', 5).followUpProjectId).toBe('p1')
  })

  it('asks for waiting-for and calendar items too', () => {
    const data = { ...base, items: [item({ id: 'w', projectId: 'p1', status: 'waiting' })] }
    expect(completeItem(data, 'w', 5).followUpProjectId).toBe('p1')
  })

  it('does not ask for standalone actions or inactive projects', () => {
    expect(completeItem(base, 'b', 5).followUpProjectId).toBeUndefined()
    const someday = { ...base, projects: [project({ id: 'p1', status: 'someday' })] }
    expect(completeItem(someday, 'a', 5).followUpProjectId).toBeUndefined()
  })
})

describe('deleting an item', () => {
  it('asks only when it removes the project’s last open item', () => {
    const data: GtdData = {
      projects: [project({ id: 'p1' })],
      items: [item({ id: 'a', projectId: 'p1' }), item({ id: 'b', projectId: 'p1' })],
    }
    const first = deleteItem(data, 'a')
    expect(first.followUpProjectId).toBeUndefined()
    expect(deleteItem(first.data, 'b').followUpProjectId).toBe('p1')
  })
})

describe('completing a project', () => {
  it('closes its remaining open items so nothing orphaned stays on a list', () => {
    const data: GtdData = {
      projects: [project({ id: 'p1' })],
      items: [item({ id: 'a', projectId: 'p1' }), item({ id: 'b', projectId: 'p1', status: 'someday' })],
    }
    const next = completeProject(data, 'p1', 9)
    expect(next.projects[0]).toMatchObject({ status: 'done', completedAt: 9 })
    expect(next.items.map((i) => i.status)).toEqual(['done', 'someday'])
  })
})

describe('tickler', () => {
  it('sends someday items back to the Inbox on their day', () => {
    const items = [
      item({ id: 'due', status: 'someday', ticklerDate: TODAY }),
      item({ id: 'later', status: 'someday', ticklerDate: TODAY + DAY }),
      item({ id: 'plain', status: 'someday' }),
    ]
    const { items: out, released } = releaseTickler(items, TODAY)
    expect(released).toBe(1)
    expect(out[0]).toMatchObject({ status: 'inbox', ticklerDate: undefined })
    expect(out[1].status).toBe('someday')
    expect(out[2].status).toBe('someday')
  })

  it('returns the same array when nothing is due, so the store does not re-render', () => {
    const items = [item({ status: 'someday', ticklerDate: TODAY + DAY })]
    expect(releaseTickler(items, TODAY).items).toBe(items)
  })
})

describe('next actions list', () => {
  it('hides actions of projects parked in Someday/Maybe', () => {
    const data: GtdData = {
      projects: [project({ id: 'p1', status: 'someday' })],
      items: [item({ id: 'a', projectId: 'p1' }), item({ id: 'b' })],
    }
    expect(visibleNextActions(data).map((i) => i.id)).toEqual(['b'])
  })
})

describe('normalizeContext', () => {
  it('lowercases and prefixes with @', () => {
    expect(normalizeContext(' Calls ')).toBe('@calls')
    expect(normalizeContext('@Home')).toBe('@home')
    expect(normalizeContext('  ')).toBeUndefined()
  })
})

describe('migrating data from the first version', () => {
  const v1: Parameters<typeof migrateV1>[0] = {
    tasks: [
      { id: '1', title: 'due', status: 'next', contexts: ['@Calls', '@home'], dueDate: TODAY, createdAt: 0, updatedAt: 0 },
      { id: '2', title: 'deferred', status: 'next', contexts: [], deferUntil: TODAY + DAY, createdAt: 0, updatedAt: 0 },
      { id: '3', title: 'defer passed', status: 'next', contexts: [], deferUntil: TODAY - DAY, createdAt: 0, updatedAt: 0 },
      { id: '4', title: 'wait', status: 'waiting', contexts: [], waitingOn: 'Ann', createdAt: 0, updatedAt: 7 },
      { id: '5', title: 'old', status: 'completed', contexts: [], createdAt: 0, updatedAt: 0, completedAt: 3 },
    ],
    projects: [{ id: 'p', name: 'P', notes: 'launch', status: 'completed', createdAt: 0 }],
    lastReviewAt: 42,
  }

  it('moves deadlines to the calendar and future defers to the tickler', () => {
    const data = migrateV1(v1, TODAY)
    expect(data.items[0]).toMatchObject({ status: 'calendar', date: TODAY, context: '@calls' })
    expect(data.items[1]).toMatchObject({ status: 'someday', ticklerDate: TODAY + DAY })
    expect(data.items[2]).toMatchObject({ status: 'next' })
    expect(data.items[2]).not.toHaveProperty('deferUntil')
    expect(data.items[3]).toMatchObject({ status: 'waiting', waitingOn: 'Ann', waitingSince: 7 })
    expect(data.items[4]).toMatchObject({ status: 'done', completedAt: 3 })
    expect(data.projects[0]).toMatchObject({ status: 'done', outcome: 'launch' })
    expect(data.lastReviewAt).toBe(42)
  })

  it('imports both old and new backup files', () => {
    expect(parseBackup(JSON.stringify(v1), TODAY).items).toHaveLength(5)
    const v2 = { version: 2, items: [item({})], projects: [project({})] }
    expect(parseBackup(JSON.stringify(v2), TODAY).items).toHaveLength(1)
    expect(() => parseBackup('{"items":[{"id":1}],"projects":[]}', TODAY)).toThrow()
    expect(() => parseBackup('nope', TODAY)).toThrow()
  })
})

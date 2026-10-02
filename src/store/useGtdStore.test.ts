import { beforeEach, describe, expect, it } from 'vitest'
import { useGtdStore } from './useGtdStore'

const store = () => useGtdStore.getState()

beforeEach(() => {
  useGtdStore.setState({ items: [], projects: [], lastReviewAt: undefined, followUpProjectId: undefined })
})

describe('project follow-up flow', () => {
  it('creating a project from an Inbox item replaces it with the first next action', () => {
    store().capture('Plan offsite')
    const inboxId = store().items[0].id
    const projectId = store().createProject({
      name: 'Plan offsite',
      outcome: 'Offsite booked',
      firstAction: { title: 'Call venue', status: 'next', context: '@calls' },
      fromItemId: inboxId,
    })
    expect(store().items).toHaveLength(1)
    expect(store().items[0]).toMatchObject({ title: 'Call venue', projectId, status: 'next' })
  })

  it('ticking a project action opens the "what’s next?" question, and answering closes it', () => {
    const projectId = store().createProject({
      name: 'P',
      firstAction: { title: 'Step 1', status: 'next' },
    })
    store().completeItem(store().items[0].id)
    expect(store().followUpProjectId).toBe(projectId)

    store().addItem({ title: 'Step 2', status: 'waiting', waitingOn: 'Ann', projectId })
    store().dismissFollowUp()
    expect(store().followUpProjectId).toBeUndefined()
    expect(store().items[0]).toMatchObject({ status: 'waiting', waitingSince: expect.any(Number) })
  })

  it('re-clarifying the only action of a project also asks', () => {
    const projectId = store().createProject({ name: 'P', firstAction: { title: 'A', status: 'next' } })
    store().reconsider(store().items[0].id)
    expect(store().followUpProjectId).toBe(projectId)
    expect(store().items[0].status).toBe('inbox')
    expect(store().items[0].projectId).toBeUndefined()
  })

  it('completing the project from the question closes the question', () => {
    const projectId = store().createProject({ name: 'P', firstAction: { title: 'A', status: 'next' } })
    store().completeItem(store().items[0].id)
    store().completeProject(projectId)
    expect(store().followUpProjectId).toBeUndefined()
    expect(store().projects[0].status).toBe('done')
  })
})

describe('tickler', () => {
  it('moves due someday items to the Inbox', () => {
    store().addItem({ title: 'Renew passport?', status: 'someday', ticklerDate: 0 })
    store().runTickler()
    expect(store().items[0].status).toBe('inbox')
  })
})

describe('re-filing', () => {
  it('drops fields that belonged to the old list', () => {
    store().addItem({ title: 'X', status: 'calendar', date: 1, time: '09:00' })
    store().fileItem(store().items[0].id, { title: 'X', status: 'next', context: '@home' })
    expect(store().items[0].date).toBeUndefined()
    expect(store().items[0].time).toBeUndefined()
  })
})

describe('editing', () => {
  it('rewords an item and a project in place', () => {
    const projectId = store().createProject({
      name: 'Plan ofsite',
      firstAction: { title: 'Cal venu', status: 'next', context: '@calls' },
    })
    store().editItem(store().items[0].id, { title: 'Call venue', notes: 'Ask about parking' })
    store().editProject(projectId, 'Plan offsite')
    expect(store().items[0]).toMatchObject({ title: 'Call venue', notes: 'Ask about parking', status: 'next', projectId })
    expect(store().projects[0].name).toBe('Plan offsite')
  })
})

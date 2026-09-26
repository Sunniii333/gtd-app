import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GtdData, Item, Project } from '../types'
import * as gtd from '../domain/gtd'
import { startOfDay } from '../utils/date'
import { generateId } from '../utils/id'

/** Fields a new item can start with. Status is required; the rest depends on the list. */
export type NewItem = Pick<Item, 'title' | 'status'> &
  Partial<Pick<Item, 'notes' | 'context' | 'projectId' | 'date' | 'time' | 'waitingOn' | 'ticklerDate'>>

type Persisted = Pick<GtdData, 'items' | 'projects'> & { lastReviewAt: number | undefined }

interface GtdState extends GtdData {
  /** Not persisted: the project whose "what's next?" question is on screen. */
  followUpProjectId?: string

  capture: (title: string) => void
  addItem: (fields: NewItem) => void
  /** Turns an existing item (usually from the Inbox) into what it was clarified to be. */
  fileItem: (id: string, fields: NewItem) => void
  updateItem: (id: string, patch: Partial<Item>) => void
  completeItem: (id: string) => void
  deleteItem: (id: string) => void
  /** Back to the Inbox to be clarified again (activating a Someday item, a missed calendar entry…). */
  reconsider: (id: string) => void

  /** Creates a project with its outcome and first next action, from an Inbox item or from scratch. */
  createProject: (p: { name: string; outcome?: string; firstAction?: NewItem; fromItemId?: string }) => string
  updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'outcome'>>) => void
  completeProject: (id: string) => void
  setProjectStatus: (id: string, status: 'active' | 'someday') => void

  askWhatsNext: (projectId: string) => void
  dismissFollowUp: () => void

  runTickler: () => void
  completeReview: () => void
  exportData: () => GtdData
  importData: (data: GtdData) => void
}

function makeItem(fields: NewItem, now = Date.now()): Item {
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    waitingSince: fields.status === 'waiting' ? now : undefined,
    ...fields,
  }
}

/** Clears fields that belong to other lists, so a re-filed item never carries stale dates. */
function refile(item: Item, fields: NewItem, now: number): Item {
  return {
    id: item.id,
    createdAt: item.createdAt,
    notes: item.notes,
    updatedAt: now,
    waitingSince: fields.status === 'waiting' ? now : undefined,
    ...fields,
  }
}

export const useGtdStore = create<GtdState>()(
  persist(
    (set, get) => {
      const data = (): GtdData => {
        const { items, projects, lastReviewAt } = get()
        return { items, projects, lastReviewAt }
      }
      const apply = (result: gtd.ChangeResult) =>
        set({
          items: result.data.items,
          projects: result.data.projects,
          ...(result.followUpProjectId ? { followUpProjectId: result.followUpProjectId } : {}),
        })

      return {
        items: [],
        projects: [],

        capture: (title) => set((s) => ({ items: [makeItem({ title, status: 'inbox' }), ...s.items] })),

        addItem: (fields) => set((s) => ({ items: [makeItem(fields), ...s.items] })),

        fileItem: (id, fields) =>
          set((s) => ({
            items: s.items.map((i) => (i.id === id ? refile(i, fields, Date.now()) : i)),
          })),

        updateItem: (id, patch) =>
          set((s) => ({
            items: s.items.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i)),
          })),

        completeItem: (id) => apply(gtd.completeItem(data(), id, Date.now())),

        deleteItem: (id) => apply(gtd.deleteItem(data(), id)),

        reconsider: (id) => {
          const item = get().items.find((i) => i.id === id)
          if (!item) return
          // Leaving a project's list can stall it, same as deleting.
          const { followUpProjectId } = gtd.deleteItem(data(), id)
          set((s) => ({
            items: s.items.map((i) =>
              i.id === id ? refile(i, { title: i.title, status: 'inbox' }, Date.now()) : i,
            ),
            ...(followUpProjectId ? { followUpProjectId } : {}),
          }))
        },

        createProject: ({ name, outcome, firstAction, fromItemId }) => {
          const now = Date.now()
          const id = generateId()
          const project: Project = { id, name, outcome, status: 'active', createdAt: now }
          set((s) => {
            let items = s.items
            if (fromItemId) items = items.filter((i) => i.id !== fromItemId)
            if (firstAction) items = [makeItem({ ...firstAction, projectId: id }, now), ...items]
            return { projects: [project, ...s.projects], items }
          })
          return id
        },

        updateProject: (id, patch) =>
          set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

        completeProject: (id) => {
          const next = gtd.completeProject(data(), id, Date.now())
          set({
            items: next.items,
            projects: next.projects,
            followUpProjectId: get().followUpProjectId === id ? undefined : get().followUpProjectId,
          })
        },

        setProjectStatus: (id, status) =>
          set((s) => ({
            projects: s.projects.map((p) => (p.id === id ? { ...p, status } : p)),
            followUpProjectId: s.followUpProjectId === id ? undefined : s.followUpProjectId,
          })),

        askWhatsNext: (projectId) => set({ followUpProjectId: projectId }),
        dismissFollowUp: () => set({ followUpProjectId: undefined }),

        runTickler: () => {
          const { items, released } = gtd.releaseTickler(get().items, startOfDay())
          if (released) set({ items })
        },

        completeReview: () => set({ lastReviewAt: Date.now() }),

        exportData: data,

        importData: (imported) =>
          set({
            items: imported.items,
            projects: imported.projects,
            lastReviewAt: imported.lastReviewAt,
            followUpProjectId: undefined,
          }),
      }
    },
    {
      name: 'gtd-storage',
      version: 2,
      partialize: ({ items, projects, lastReviewAt }): Persisted => ({ items, projects, lastReviewAt }),
      migrate: (persisted, version): Persisted => {
        if (version < 2) {
          const old = persisted as Parameters<typeof gtd.migrateV1>[0]
          const data = gtd.migrateV1(
            { tasks: old?.tasks ?? [], projects: old?.projects ?? [], lastReviewAt: old?.lastReviewAt },
            startOfDay(),
          )
          return { ...data, lastReviewAt: data.lastReviewAt }
        }
        return persisted as Persisted
      },
    },
  ),
)

/** Selector helper: the plain data slice, for the pure functions in domain/gtd. */
export const selectData = (s: GtdState): GtdData => s

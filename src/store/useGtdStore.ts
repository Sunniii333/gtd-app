import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ProjectStatus, Task, TaskStatus } from '../types'
import type { BackupFile } from '../utils/backup'
import { generateId } from '../utils/id'

interface GtdState {
  tasks: Task[]
  projects: Project[]

  addTask: (title: string) => void
  addTaskToProject: (title: string, projectId: string) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void

  clarifyToNext: (id: string, contexts: string[], projectId?: string) => void
  clarifyToWaiting: (id: string, waitingOn: string) => void
  clarifyToSomeday: (id: string) => void
  clarifyToProject: (id: string, projectName: string) => void

  addProject: (name: string, notes?: string) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  setProjectStatus: (id: string, status: ProjectStatus) => void

  exportData: () => BackupFile
  importData: (backup: BackupFile) => void
}

export const useGtdStore = create<GtdState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],

      addTask: (title) =>
        set((state) => {
          const now = Date.now()
          const task: Task = {
            id: generateId(),
            title,
            status: 'inbox' as TaskStatus,
            contexts: [],
            createdAt: now,
            updatedAt: now,
          }
          return { tasks: [task, ...state.tasks] }
        }),

      addTaskToProject: (title, projectId) =>
        set((state) => {
          const now = Date.now()
          const task: Task = {
            id: generateId(),
            title,
            status: 'next',
            contexts: [],
            projectId,
            createdAt: now,
            updatedAt: now,
          }
          return { tasks: [task, ...state.tasks] }
        }),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'completed', completedAt: Date.now(), updatedAt: Date.now() }
              : t,
          ),
        })),

      clarifyToNext: (id, contexts, projectId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'next', contexts, projectId, updatedAt: Date.now() }
              : t,
          ),
        })),

      clarifyToWaiting: (id, waitingOn) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: 'waiting', waitingOn, updatedAt: Date.now() } : t,
          ),
        })),

      clarifyToSomeday: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: 'someday', updatedAt: Date.now() } : t,
          ),
        })),

      clarifyToProject: (id, projectName) =>
        set((state) => {
          const now = Date.now()
          const project: Project = {
            id: generateId(),
            name: projectName,
            status: 'active',
            createdAt: now,
          }
          return {
            projects: [project, ...state.projects],
            tasks: state.tasks.map((t) =>
              t.id === id
                ? { ...t, status: 'next', projectId: project.id, updatedAt: now }
                : t,
            ),
          }
        }),

      addProject: (name, notes) => {
        const id = generateId()
        set((state) => ({
          projects: [
            { id, name, notes, status: 'active', createdAt: Date.now() },
            ...state.projects,
          ],
        }))
        return id
      },

      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      setProjectStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      exportData: () => {
        const { tasks, projects } = get()
        return { version: 1, exportedAt: Date.now(), tasks, projects }
      },

      importData: (backup) =>
        set({ tasks: backup.tasks, projects: backup.projects }),
    }),
    { name: 'gtd-storage' },
  ),
)

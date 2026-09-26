import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ItemRow } from '../components/ItemRow'
import { Button, Empty, Page, SectionTitle } from '../components/ui'
import { isOpen } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'
import type { Item } from '../types'
import { fromDateInput, toDateInput } from '../utils/date'

function TicklerInput({ item }: { item: Item }) {
  const updateItem = useGtdStore((s) => s.updateItem)
  return (
    <input
      type="date"
      value={item.ticklerDate !== undefined ? toDateInput(item.ticklerDate) : ''}
      onChange={(e) => updateItem(item.id, { ticklerDate: fromDateInput(e.target.value) })}
      title="Tickler: bring it back to the Inbox on this day"
      aria-label="Tickler date"
      className="w-[8.5rem] rounded border border-hairline bg-canvas px-1.5 py-0.5 text-xs text-muted focus:border-ink focus:outline-none"
    />
  )
}

export function SomedayMaybe() {
  const allItems = useGtdStore((s) => s.items)
  const projects = useGtdStore((s) => s.projects)
  const reconsider = useGtdStore((s) => s.reconsider)
  const setProjectStatus = useGtdStore((s) => s.setProjectStatus)
  const askWhatsNext = useGtdStore((s) => s.askWhatsNext)

  const items = useMemo(() => allItems.filter((i) => i.status === 'someday'), [allItems])
  const parkedProjects = useMemo(() => projects.filter((p) => p.status === 'someday'), [projects])

  const activate = (projectId: string) => {
    setProjectStatus(projectId, 'active')
    const moving = allItems.some((i) => i.projectId === projectId && isOpen(i))
    if (!moving) askWhatsNext(projectId)
  }

  return (
    <Page
      title="Someday/Maybe"
      subtitle="Incubating. Nothing here is a commitment. Give an item a tickler date to have it return to your Inbox on that day."
    >
      {parkedProjects.length > 0 && (
        <>
          <SectionTitle>Projects on hold</SectionTitle>
          <ul className="mb-4">
            {parkedProjects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 border-b border-hairline py-3.5 last:border-0">
                <Link to={`/projects/${p.id}`} className="text-sm text-ink hover:underline">
                  {p.name}
                </Link>
                <Button className="shrink-0 text-xs" onClick={() => activate(p.id)}>
                  Activate
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {parkedProjects.length > 0 && <SectionTitle>Ideas</SectionTitle>}
      {items.length === 0 ? (
        <Empty>Nothing incubating.</Empty>
      ) : (
        <ul>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              extra={
                <>
                  <TicklerInput item={item} />
                  <Button variant="ghost" onClick={() => reconsider(item.id)} title="Move to the Inbox and clarify it">
                    Activate
                  </Button>
                </>
              }
            />
          ))}
        </ul>
      )}
    </Page>
  )
}

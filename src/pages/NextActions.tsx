import { useMemo, useState } from 'react'
import { ItemRow } from '../components/ItemRow'
import { Empty, Page, Pills, SectionTitle } from '../components/ui'
import { visibleNextActions } from '../domain/gtd'
import { useGtdStore } from '../store/useGtdStore'

const NO_CONTEXT = '(no context)'

export function NextActions() {
  const items = useGtdStore((s) => s.items)
  const projects = useGtdStore((s) => s.projects)
  const [filter, setFilter] = useState('all')

  // One list per context, as in the book: pick the list for where you are right now.
  const groups = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const item of visibleNextActions({ items, projects }).sort((a, b) => a.createdAt - b.createdAt)) {
      const key = item.context ?? NO_CONTEXT
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return [...map.entries()].sort(([a], [b]) =>
      a === NO_CONTEXT ? 1 : b === NO_CONTEXT ? -1 : a.localeCompare(b),
    )
  }, [items, projects])

  const shown = filter === 'all' ? groups : groups.filter(([c]) => c === filter)

  return (
    <Page
      title="Next Actions"
      subtitle="Choose by context first, then time available, energy, and priority — in that order."
    >
      {groups.length > 1 && (
        <div className="mb-6">
          <Pills
            options={[
              { value: 'all', label: 'All' },
              ...groups.map(([c, list]) => ({ value: c, label: `${c} ${list.length}` })),
            ]}
            value={shown.length ? filter : 'all'}
            onChange={setFilter}
          />
        </div>
      )}

      {shown.length === 0 && <Empty>No next actions. Process your Inbox or review your Projects.</Empty>}

      {shown.map(([context, list]) => (
        <section key={context}>
          <SectionTitle>{context}</SectionTitle>
          <ul>
            {list.map((item) => (
              <ItemRow key={item.id} item={item} showContext={false} />
            ))}
          </ul>
        </section>
      ))}
    </Page>
  )
}

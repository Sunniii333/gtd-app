import { useMemo, useState } from 'react'
import { ItemRow } from '../components/ItemRow'
import { Empty, Page, inputClass } from '../components/ui'
import { useGtdStore } from '../store/useGtdStore'

export function Reference() {
  const allItems = useGtdStore((s) => s.items)
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allItems
      .filter((i) => i.status === 'reference')
      .filter((i) => !q || `${i.title} ${i.notes ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [allItems, query])

  return (
    <Page title="Reference" subtitle="Not actionable, worth keeping. Easy to find, never in the way of your actions.">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search reference…"
        className={`mb-4 ${inputClass}`}
      />
      {items.length === 0 ? (
        <Empty>{query ? 'Nothing matches.' : 'Nothing filed yet. Clarify an item as Reference to keep it here.'}</Empty>
      ) : (
        <ul>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Page>
  )
}

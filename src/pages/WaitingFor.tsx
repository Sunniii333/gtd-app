import { useMemo } from 'react'
import { ItemRow } from '../components/ItemRow'
import { Empty, Page } from '../components/ui'
import { useGtdStore } from '../store/useGtdStore'

export function WaitingFor() {
  const allItems = useGtdStore((s) => s.items)
  // Longest-waiting first: those are the ones that need chasing.
  const items = useMemo(
    () =>
      allItems
        .filter((i) => i.status === 'waiting')
        .sort((a, b) => (a.waitingSince ?? a.updatedAt) - (b.waitingSince ?? b.updatedAt)),
    [allItems],
  )

  return (
    <Page
      title="Waiting For"
      subtitle="Delegated or promised by someone else. Tick it when it arrives; chase what has sat too long."
    >
      {items.length === 0 ? (
        <Empty>Nothing pending on others.</Empty>
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

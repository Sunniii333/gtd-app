import { useMemo, useState } from 'react'
import { ClarifyDialog } from '../components/ClarifyDialog'
import { EditButton, EditForm } from '../components/EditForm'
import { Button, Empty, Page } from '../components/ui'
import { useGtdStore } from '../store/useGtdStore'
import type { Item } from '../types'

export function Inbox() {
  const allItems = useGtdStore((s) => s.items)
  // Oldest first: the book says process from the top, one item at a time, in order.
  const items = useMemo(
    () => allItems.filter((i) => i.status === 'inbox').sort((a, b) => a.createdAt - b.createdAt),
    [allItems],
  )
  const [clarifyingId, setClarifyingId] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editItem = useGtdStore((s) => s.editItem)
  // While processing, finishing one item moves straight on to the next until the Inbox is empty.
  const clarifying: Item | undefined =
    items.find((i) => i.id === clarifyingId) ?? (processing ? items[0] : undefined)
  const close = () => {
    setProcessing(false)
    setClarifyingId(null)
  }

  return (
    <Page
      title="Inbox"
      subtitle="Everything captured, nothing decided yet. Take the top item, decide what it is, never put it back."
      action={
        items.length > 0 && (
          <Button
            variant="primary"
            onClick={() => {
              setProcessing(true)
              setClarifyingId(items[0].id)
            }}
          >
            Process all
          </Button>
        )
      }
    >
      {items.length === 0 ? (
        <Empty>Inbox zero. Everything is clarified.</Empty>
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="step group flex items-center justify-between gap-3 border-b border-dashed border-hairline py-3.5 last:border-0"
            >
              {editingId === item.id ? (
                <EditForm
                  title={item.title}
                  notes={item.notes}
                  withNotes
                  onSave={(text) => {
                    editItem(item.id, text)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-sm text-ink">{item.title}</span>
                  <EditButton onClick={() => setEditingId(item.id)} />
                  <Button className="shrink-0 text-xs" onClick={() => setClarifyingId(item.id)}>
                    Clarify
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {clarifying && (
        <ClarifyDialog
          key={clarifying.id}
          item={clarifying}
          onClose={() => {
            // A processed item has left the Inbox; only a cancel leaves it here.
            const inbox = useGtdStore.getState().items.filter((i) => i.status === 'inbox')
            const cancelled = inbox.some((i) => i.id === clarifying.id)
            if (!processing || cancelled || inbox.length === 0) close()
          }}
        />
      )}
    </Page>
  )
}

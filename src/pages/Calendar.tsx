import { useMemo, useState } from 'react'
import { ItemRow } from '../components/ItemRow'
import { NextStepForm } from '../components/NextStepForm'
import { Button, Empty, Page, SectionTitle } from '../components/ui'
import { useGtdStore } from '../store/useGtdStore'
import type { Item } from '../types'
import { formatDay, fromDateInput, startOfDay, toDateInput } from '../utils/date'

const byDateThenTime = (a: Item, b: Item) =>
  (a.date ?? 0) - (b.date ?? 0) || (a.time ?? '').localeCompare(b.time ?? '')

/** A missed calendar entry must get a decision, never silently scroll away. */
function MissedActions({ item }: { item: Item }) {
  const updateItem = useGtdStore((s) => s.updateItem)
  const [moving, setMoving] = useState(false)
  if (moving) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={toDateInput(startOfDay())}
        onChange={(e) => {
          const date = fromDateInput(e.target.value)
          if (date !== undefined) updateItem(item.id, { date })
        }}
        onBlur={() => setMoving(false)}
        className="rounded border border-hairline bg-canvas px-1.5 py-0.5 text-xs text-ink"
      />
    )
  }
  return (
    <Button variant="ghost" onClick={() => setMoving(true)} title="Move to another day">
      Move
    </Button>
  )
}

export function Calendar() {
  const allItems = useGtdStore((s) => s.items)
  const addItem = useGtdStore((s) => s.addItem)
  const [adding, setAdding] = useState(false)
  const today = startOfDay()

  const { missed, todays, upcoming } = useMemo(() => {
    const cal = allItems.filter((i) => i.status === 'calendar' && i.date !== undefined).sort(byDateThenTime)
    return {
      missed: cal.filter((i) => i.date! < today),
      todays: cal.filter((i) => i.date === today),
      upcoming: cal.filter((i) => i.date! > today),
    }
  }, [allItems, today])

  const upcomingDays = useMemo(() => {
    const groups = new Map<number, Item[]>()
    for (const i of upcoming) groups.set(i.date!, [...(groups.get(i.date!) ?? []), i])
    return [...groups.entries()]
  }, [upcoming])

  return (
    <Page
      title="Calendar"
      subtitle="The hard landscape: only what must happen on that day. Look here first, then at your Next Actions."
      action={<Button onClick={() => setAdding((a) => !a)}>{adding ? 'Close' : '+ Add'}</Button>}
    >
      {adding && (
        <div className="mb-8 rounded-xl border border-hairline bg-surface p-4">
          <NextStepForm
            kinds={['calendar']}
            autoFocus
            submitLabel="Add to calendar"
            onSubmit={(fields) => {
              addItem(fields)
              setAdding(false)
            }}
          />
        </div>
      )}

      {missed.length > 0 && (
        <section className="mb-8 rounded-xl border border-hairline bg-pale-red/40 px-4 pt-3">
          <SectionTitle tone="warn">Passed without being done — decide each one</SectionTitle>
          <p className="text-xs text-muted">Tick if it happened, move it to a new day, or ↺ re-clarify it.</p>
          <ul>
            {missed.map((item) => (
              <ItemRow key={item.id} item={item} extra={<MissedActions item={item} />} />
            ))}
          </ul>
        </section>
      )}

      <SectionTitle>Today · {new Date(today).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</SectionTitle>
      {todays.length === 0 ? (
        <p className="py-3 text-sm text-muted">Nothing is fixed to today. Work from your Next Actions.</p>
      ) : (
        <ul>
          {todays.map((item) => (
            <ItemRow key={item.id} item={item} showDate={false} />
          ))}
        </ul>
      )}

      {upcomingDays.map(([day, items]) => (
        <section key={day}>
          <SectionTitle>{formatDay(day, today)}</SectionTitle>
          <ul>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} showDate={false} />
            ))}
          </ul>
        </section>
      ))}

      {missed.length + todays.length + upcoming.length === 0 && !adding && (
        <Empty>No day-specific commitments.</Empty>
      )}
    </Page>
  )
}

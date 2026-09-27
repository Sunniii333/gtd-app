/** What to write to the Cloud copy after the store moved from `prev` to `next`. The store never mutates, so a new object means a changed record. */
export function diffRecords<T extends { id: string }>(prev: T[], next: T[]) {
  const before = new Map(prev.map((r) => [r.id, r]))
  const after = new Set(next.map((r) => r.id))
  return {
    upserts: next.filter((r) => before.get(r.id) !== r),
    deletes: prev.filter((r) => !after.has(r.id)).map((r) => r.id),
  }
}

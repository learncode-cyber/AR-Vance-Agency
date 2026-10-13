// Cursor (keyset-style) pagination helpers.
// Fetch `limit + 1` rows; if we got the extra one there is a next page and the
// cursor is the id of the last row we return. Stable with concurrent inserts,
// and O(limit) regardless of depth (offset pagination is O(skip)).

export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

export function parseLimit(raw: string | null | undefined, fallback = DEFAULT_PAGE_SIZE, max = MAX_PAGE_SIZE): number {
  const n = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(n, max)
}

/** Opaque-enough cursor validation: Prisma cuids/uuids only, so junk can't reach the query. */
export function parseCursor(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  return /^[A-Za-z0-9_-]{8,64}$/.test(raw) ? raw : undefined
}

export function toPage<T extends { id: string }>(rows: T[], limit: number): { items: T[]; nextCursor: string | null } {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null }
}

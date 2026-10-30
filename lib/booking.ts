// Pure helpers for consultation booking (kept free of Prisma so they are unit-testable).
// All times are treated as "wall-clock UTC" so server timezone can't shift a booking
// to a different day: 2026-11-01 + 10:00 is stored as 2026-11-01T10:00:00Z.

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function parseSlotDateTime(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return null
  const d = new Date(`${date}T${time}:00.000Z`)
  if (Number.isNaN(d.getTime())) return null
  // reject rollovers like 2026-02-31
  if (d.toISOString().slice(0, 10) !== date) return null
  return d
}

export function dayRangeUtc(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`)
  return { start, end: new Date(start.getTime() + 86_400_000) }
}

export function dayOfWeekUtc(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay()
}

export function isPast(slot: Date, now = new Date(), leadMinutes = 0): boolean {
  return slot.getTime() < now.getTime() + leadMinutes * 60_000
}

export function addMinutesHHMM(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (h * 60 + m + minutes) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

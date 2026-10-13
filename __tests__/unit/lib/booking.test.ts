import { parseSlotDateTime, dayRangeUtc, dayOfWeekUtc, isPast, addMinutesHHMM } from '@/lib/booking'

describe('booking helpers', () => {
  it('parses valid slots as UTC wall-clock', () => {
    expect(parseSlotDateTime('2026-11-01', '10:30')?.toISOString()).toBe('2026-11-01T10:30:00.000Z')
  })
  it('rejects malformed, impossible and rolled-over dates/times', () => {
    for (const [d, t] of [['2026-11-1', '10:00'], ['2026-02-31', '10:00'], ['2026-13-01', '10:00'], ['2026-11-01', '24:00'], ['2026-11-01', '9:00'], ['2026-11-01', '10:60'], ['abc', 'def'], ['', '']]) {
      expect(parseSlotDateTime(d, t)).toBeNull()
    }
  })
  it('day range is exactly 24h in UTC and weekday is correct (2026-11-01 is a Sunday)', () => {
    const r = dayRangeUtc('2026-11-01'); expect(r.end.getTime() - r.start.getTime()).toBe(86_400_000)
    expect(dayOfWeekUtc('2026-11-01')).toBe(0); expect(dayOfWeekUtc('2026-11-02')).toBe(1)
  })
  it('isPast honours the lead time', () => {
    const now = new Date('2026-11-01T10:00:00Z')
    expect(isPast(new Date('2026-11-01T09:59:00Z'), now)).toBe(true)
    expect(isPast(new Date('2026-11-01T10:30:00Z'), now, 60)).toBe(true)
    expect(isPast(new Date('2026-11-01T11:01:00Z'), now, 60)).toBe(false)
  })
  it('adds minutes with wraparound', () => {
    expect(addMinutesHHMM('10:30', 45)).toBe('11:15'); expect(addMinutesHHMM('23:30', 60)).toBe('00:30'); expect(addMinutesHHMM('09:05', 30)).toBe('09:35')
  })
})

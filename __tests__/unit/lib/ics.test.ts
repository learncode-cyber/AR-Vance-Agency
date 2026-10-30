/** @jest-environment node */
import ICAL from 'ical.js'
import { buildIcs, foldLine, icsEscape, icsDate } from '@/lib/export/ics'

const ev = {
  uid: 'consultation-1@arvance',
  title: 'Consultation: SEO, Strategy; "Intro"',
  start: new Date('2026-11-02T10:00:00Z'),
  end: new Date('2026-11-02T10:30:00Z'),
  description: 'Line one\nLine two, with comma; and semicolon \\ backslash',
  location: 'https://meet.example.com/room',
  attendeeEmail: 'client@example.com',
  attendeeName: 'আরিফ হোসেন',
  organizerEmail: 'hello@arvance.example',
}

describe('ics', () => {
  it('escapes text per RFC 5545', () => {
    expect(icsEscape('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
    expect(icsEscape('x\u0000y')).toBe('xy')
  })
  it('formats UTC dates', () => { expect(icsDate(new Date('2026-01-02T03:04:05Z'))).toBe('20260102T030405Z') })
  it('folds long lines at ≤75 octets without splitting multi-byte characters', () => {
    const line = 'DESCRIPTION:' + 'আরিফ'.repeat(40)
    const folded = foldLine(line)
    for (const part of folded.split('\r\n')) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75)
    expect(folded.replace(/\r\n /g, '')).toBe(line)
  })
  it('produces a calendar a real parser (ical.js) reads back correctly', () => {
    const text = buildIcs([ev], { method: 'REQUEST', calendarName: 'Test' })
    expect(text.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true); expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(text).not.toMatch(/(?<!\r)\n/)
    const cal = new ICAL.Component(ICAL.parse(text) as unknown[])
    expect(cal.getFirstPropertyValue('method')).toBe('REQUEST')
    const vevent = cal.getFirstSubcomponent('vevent')!
    const e = new ICAL.Event(vevent)
    expect(e.uid).toBe('consultation-1@arvance')
    expect(e.summary).toBe('Consultation: SEO, Strategy; "Intro"')
    expect(e.description).toBe('Line one\nLine two, with comma; and semicolon \\ backslash')
    expect(e.location).toBe('https://meet.example.com/room')
    expect(e.startDate.toJSDate().toISOString()).toBe('2026-11-02T10:00:00.000Z')
    expect(e.endDate.toJSDate().toISOString()).toBe('2026-11-02T10:30:00.000Z')
    expect(vevent.getFirstPropertyValue('status')).toBe('CONFIRMED')
    expect(e.attendees[0].getFirstValue()).toBe('mailto:client@example.com')
    expect(e.attendees[0].getParameter('cn')).toBe('আরিফ হোসেন')
  })
  it('cannot be tricked into extra properties by line breaks in user text', () => {
    const text = buildIcs([{ ...ev, title: 'Hi\r\nATTENDEE:mailto:evil@example.com', attendeeEmail: 'a@example.com\r\nX-EVIL:1' }])
    expect(text).not.toMatch(/^ATTENDEE:mailto:evil/m); expect(text).not.toMatch(/^X-EVIL/m)
    const cal = new ICAL.Component(ICAL.parse(text) as unknown[]); expect(cal.getFirstSubcomponent('vevent')!.getAllProperties('attendee')).toHaveLength(1)
  })
  it('supports multiple events (calendar feed)', () => {
    const text = buildIcs([ev, { ...ev, uid: 'two@arvance', status: 'CANCELLED' }])
    expect(new ICAL.Component(ICAL.parse(text) as unknown[]).getAllSubcomponents('vevent')).toHaveLength(2)
  })
})

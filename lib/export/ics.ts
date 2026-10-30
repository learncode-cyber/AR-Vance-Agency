// RFC 5545 iCalendar (.ics) generator — real calendar files that open in Google Calendar,
// Apple Calendar and Outlook. Handles text escaping, 75-octet line folding (UTF-8 aware,
// never splitting a multi-byte character), UTC timestamps and CRLF line endings.

export interface IcsEvent {
  uid: string
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
  url?: string
  status?: 'CONFIRMED' | 'CANCELLED' | 'TENTATIVE'
  organizerEmail?: string
  attendeeEmail?: string
  attendeeName?: string
  sequence?: number
}

export interface IcsOptions {
  /** METHOD:REQUEST makes mail clients show Add/Accept buttons; PUBLISH is for plain files/feeds. */
  method?: 'PUBLISH' | 'REQUEST' | 'CANCEL'
  calendarName?: string
  prodId?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
export const icsDate = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`

/** Escape a TEXT value: backslash, semicolon, comma, newline; drop other control characters. */
export function icsEscape(v: string): string {
  return v
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
}

/** Fold a content line to ≤75 octets per physical line, continuing with a single space. */
export function foldLine(line: string): string {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const out: string[] = []
  let cur = ''
  let curBytes = 0
  let limit = 75
  for (const ch of Array.from(line)) {
    const b = enc.encode(ch).length
    if (curBytes + b > limit) {
      out.push(cur)
      cur = ''
      curBytes = 0
      limit = 74 // continuation lines start with one space
    }
    cur += ch
    curBytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}

/** Parameter values (CN=) must not contain ; : , or quotes. */
const param = (v: string) => `"${v.replace(/["\r\n]/g, '')}"`
const mailto = (e: string) => `mailto:${e.replace(/[\r\n\s]/g, '')}`

export function buildIcs(events: IcsEvent[], opts: IcsOptions = {}): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${opts.prodId ?? '-//AR Vance Agency//Booking//EN'}`,
    'CALSCALE:GREGORIAN',
    `METHOD:${opts.method ?? 'PUBLISH'}`,
  ]
  if (opts.calendarName) lines.push(`X-WR-CALNAME:${icsEscape(opts.calendarName)}`)
  const stamp = icsDate(new Date())

  for (const e of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.uid.replace(/[\r\n\s]/g, '')}`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART:${icsDate(e.start)}`)
    lines.push(`DTEND:${icsDate(e.end)}`)
    lines.push(`SUMMARY:${icsEscape(e.title)}`)
    if (e.description) lines.push(`DESCRIPTION:${icsEscape(e.description)}`)
    if (e.location) lines.push(`LOCATION:${icsEscape(e.location)}`)
    if (e.url && /^https?:\/\//.test(e.url)) lines.push(`URL:${e.url.replace(/[\r\n\s]/g, '')}`)
    lines.push(`STATUS:${e.status ?? 'CONFIRMED'}`)
    lines.push(`SEQUENCE:${e.sequence ?? 0}`)
    if (e.organizerEmail) lines.push(`ORGANIZER:${mailto(e.organizerEmail)}`)
    if (e.attendeeEmail) lines.push(`ATTENDEE;CN=${param(e.attendeeName || e.attendeeEmail)};RSVP=FALSE:${mailto(e.attendeeEmail)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

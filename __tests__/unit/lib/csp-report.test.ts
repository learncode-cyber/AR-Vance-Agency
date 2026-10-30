import { parseCspReports } from '@/lib/csp-report'

describe('parseCspReports', () => {
  it('parses the legacy report-uri format', () => {
    const r = parseCspReports({ 'csp-report': { 'effective-directive': 'script-src', 'blocked-uri': 'https://evil.example/x.js', 'document-uri': 'https://site.example/', 'source-file': 'https://site.example/a.js' } })
    expect(r).toEqual([{ directive: 'script-src', blocked: 'https://evil.example/x.js', page: 'https://site.example/', source: 'https://site.example/a.js' }])
  })
  it('parses the Reporting API array format', () => {
    const r = parseCspReports([{ type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'inline', documentURL: 'https://s.example/p' } }])
    expect(r[0]).toMatchObject({ directive: 'img-src', blocked: 'inline', page: 'https://s.example/p' })
  })
  it('strips newlines and clips long values (log injection)', () => {
    const r = parseCspReports({ 'csp-report': { 'effective-directive': 'script-src', 'blocked-uri': 'a\nFAKE LOG LINE' + 'x'.repeat(500) } })
    expect(r[0].blocked).not.toMatch(/\n/); expect(r[0].blocked.length).toBeLessThanOrEqual(200)
  })
  it('ignores junk and caps the number of reports', () => {
    expect(parseCspReports(null)).toEqual([]); expect(parseCspReports('x')).toEqual([]); expect(parseCspReports({})).toEqual([])
    const many = Array.from({ length: 50 }, () => ({ 'csp-report': { 'effective-directive': 'img-src' } }))
    expect(parseCspReports(many)).toHaveLength(10)
  })
})

/** @jest-environment node */
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { renderExport, safeFileName, cellText, MAX_EXPORT_ROWS } from '@/lib/export'
import type { ExportTable } from '@/lib/export'

const table: ExportTable = {
  title: 'Leads — লিড',
  subtitle: 'All stages',
  generatedAt: new Date('2026-10-13T10:00:00Z'),
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'value', label: 'Value', type: 'currency' },
    { key: 'created', label: 'Created', type: 'datetime' },
    { key: 'won', label: 'Won', type: 'boolean' },
    { key: 'extra', label: 'Extra' },
  ],
  rows: [
    { name: 'আরিফ হোসেন', company: '=HYPERLINK("http://evil.example","x")', value: 1234.5, created: new Date('2026-10-01T09:30:00Z'), won: true, extra: null },
    { name: 'Mixed নাম', company: '+SUM(1,1)', value: 0, created: '2026-10-02T00:00:00Z', won: false, extra: { a: 1 } },
  ],
}

describe('export formats', () => {
  it('PDF is a real PDF with pages, Bengali included, and no HTML inside', async () => {
    const buf = await renderExport('pdf', table)
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect(buf.subarray(-16).toString('latin1')).toContain('%%EOF')
    expect(buf.toString('latin1')).not.toContain('<html')
    expect((buf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThanOrEqual(1)
  })
  it('PDF paginates large tables', async () => {
    const rows = Array.from({ length: 200 }, (_, i) => ({ name: `Row ${i}`, company: 'X', value: i, created: new Date(), won: false, extra: '' }))
    const buf = await renderExport('pdf', { ...table, rows })
    expect((buf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThan(3)
  })
  it('PDF with an empty table still renders', async () => {
    expect((await renderExport('pdf', { ...table, rows: [] })).subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })
  it('XLSX is a real workbook: typed numbers/dates, header, filter, text stays text', async () => {
    const buf = await renderExport('xlsx', table)
    expect(buf.subarray(0, 2).toString('latin1')).toBe('PK')
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf as unknown as ArrayBuffer)
    const ws = wb.worksheets[0]
    expect(ws.name).toBe('Leads — লিড')
    expect(ws.getRow(1).values).toEqual([undefined, 'Name', 'Company', 'Value', 'Created', 'Won', 'Extra'])
    expect(ws.getCell('A2').value).toBe('আরিফ হোসেন')
    expect(ws.getCell('B2').value).toBe('=HYPERLINK("http://evil.example","x")')
    expect(typeof ws.getCell('C2').value).toBe('number'); expect(ws.getCell('C2').value).toBe(1234.5)
    expect(ws.getCell('D2').value).toBeInstanceOf(Date)
    expect(ws.getCell('E2').value).toBe('Yes')
    expect(ws.autoFilter).toBeTruthy(); expect(ws.views[0].state).toBe('frozen')
    expect(ws.rowCount).toBe(3)
  })
  it('CSV has a BOM, CRLF, formatted cells and neutralises formula injection', async () => {
    const text = (await renderExport('csv', table)).toString('utf8')
    expect(text.charCodeAt(0)).toBe(0xfeff)
    expect(text).toContain('\r\n')
    expect(text).toContain('Name,Company,Value,Created,Won,Extra')
    expect(text).toContain("'=HYPERLINK")
    expect(text).toContain("'+SUM(1,1)")
    expect(text).toContain('"1,234.50"'); expect(text).toContain('2026-10-01 09:30 UTC'); expect(text).toContain('আরিফ হোসেন')
  })
  it('DOCX is a real Word package containing the data', async () => {
    const buf = await renderExport('docx', table)
    const zip = await JSZip.loadAsync(buf)
    expect(Object.keys(zip.files)).toEqual(expect.arrayContaining(['[Content_Types].xml', 'word/document.xml']))
    const xml = await zip.file('word/document.xml')!.async('string')
    expect(xml).toContain('আরিফ হোসেন'); expect(xml).toContain('Company'); expect(xml).toContain('<w:tbl>')
  })
  it('caps rows at MAX_EXPORT_ROWS', async () => {
    const rows = Array.from({ length: MAX_EXPORT_ROWS + 50 }, (_, i) => ({ name: `R${i}`, company: '', value: 0, created: null, won: false, extra: '' }))
    const text = (await renderExport('csv', { ...table, rows })).toString('utf8')
    expect(text.trim().split('\r\n')).toHaveLength(MAX_EXPORT_ROWS + 1)
  })
})

describe('helpers', () => {
  it('safeFileName strips path/control characters', () => {
    expect(safeFileName('../../etc/passwd')).toBe('etc-passwd'); expect(safeFileName('Q3 "Report"\r\n')).toBe('Q3-Report'); expect(safeFileName('')).toBe('export')
  })
  it('cellText formats consistently in UTC', () => {
    expect(cellText(new Date('2026-01-02T03:04:00Z'), { key: 'a', label: 'a', type: 'datetime' })).toBe('2026-01-02 03:04 UTC')
    expect(cellText(1234.5, { key: 'a', label: 'a', type: 'currency' })).toBe('1,234.50')
    expect(cellText(null, { key: 'a', label: 'a' })).toBe(''); expect(cellText(true, { key: 'a', label: 'a' })).toBe('Yes')
    expect(cellText('a\u0000b', { key: 'a', label: 'a' })).toBe('ab')
  })
})

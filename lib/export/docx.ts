import { AlignmentType, Document, HeadingLevel, Packer, PageOrientation, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx'
import { cellText, formatDate } from './format'
import type { ExportTable } from './types'

/** A real Word document: title, generated-at line and a bordered table with a bold header row. */
export async function renderDocx(table: ExportTable): Promise<Buffer> {
  const landscape = table.columns.length > 5
  const cellRun = (text: string, bold = false) => new TextRun({ text, bold, size: 18 })

  const headerRow = new TableRow({
    tableHeader: true,
    children: table.columns.map(
      (c) => new TableCell({ shading: { fill: 'E5E7EB' }, children: [new Paragraph({ children: [cellRun(c.label, true)] })] })
    ),
  })
  const bodyRows = table.rows.map(
    (r) =>
      new TableRow({
        children: table.columns.map((c) => {
          const right = c.type === 'number' || c.type === 'currency'
          return new TableCell({
            children: [new Paragraph({ alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [cellRun(cellText(r[c.key], c))] })],
          })
        }),
      })
  )

  const doc = new Document({
    creator: 'AR Vance Agency OS',
    title: table.title,
    sections: [
      {
        properties: { page: { size: { orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT } } },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: table.title })] }),
          ...(table.subtitle ? [new Paragraph({ children: [new TextRun({ text: table.subtitle, italics: true })] })] : []),
          new Paragraph({ children: [new TextRun({ text: `Generated ${formatDate(table.generatedAt ?? new Date(), true)} · ${table.rows.length} row(s)`, size: 18, color: '6B7280' })] }),
          new Paragraph({ children: [] }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] }),
        ],
      },
    ],
  })
  return Packer.toBuffer(doc)
}

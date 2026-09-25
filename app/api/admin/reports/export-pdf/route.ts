import { NextResponse } from 'next/server'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const report = await req.json()

  try {
    // Generate HTML content for PDF
    const htmlContent = generateReportHTML(report)

    // For now, return the HTML as plain text
    // In production, use a library like puppeteer or html2pdf
    const pdfContent = Buffer.from(htmlContent, 'utf-8')

    return new Response(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 })
  }
}

function generateReportHTML(report: any): string {
  const dataRows = report.data
    .map((row: any) => {
      const cells = Object.values(row)
        .map((v: any) => `<td>${typeof v === 'number' ? v.toLocaleString() : v}</td>`)
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const headers = Object.keys(report.data[0] || {})
    .map((h) => `<th>${h}</th>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    p { color: #666; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>${report.title}</h1>
  <p><strong>Date Range:</strong> ${report.dateRange}</p>
  <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
  
  <table>
    <thead>
      <tr>${headers}</tr>
    </thead>
    <tbody>
      ${dataRows}
    </tbody>
  </table>
</body>
</html>
  `
}

// Normalises browser CSP violation reports (legacy `report-uri` and Reporting API
// formats) into a small, bounded, log-safe object.
export interface CspViolation {
  directive: string
  blocked: string
  page: string
  source?: string
}

const clip = (v: unknown, n = 200) => (typeof v === 'string' ? v.replace(/[\r\n\t]+/g, ' ').slice(0, n) : '')

export function parseCspReports(body: unknown): CspViolation[] {
  const items = Array.isArray(body) ? body : [body]
  const out: CspViolation[] = []
  for (const it of items.slice(0, 10)) {
    const r = (it as any)?.['csp-report'] ?? (it as any)?.body ?? it
    if (!r || typeof r !== 'object') continue
    const directive = clip(r['effective-directive'] ?? r.effectiveDirective ?? r['violated-directive'] ?? r.violatedDirective, 80)
    if (!directive) continue
    out.push({
      directive,
      blocked: clip(r['blocked-uri'] ?? r.blockedURL ?? r.blockedUri, 200),
      page: clip(r['document-uri'] ?? r.documentURL ?? r.documentUri, 200),
      source: clip(r['source-file'] ?? r.sourceFile, 200) || undefined,
    })
  }
  return out
}

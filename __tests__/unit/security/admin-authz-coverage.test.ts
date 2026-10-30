/**
 * Authorization coverage guard. Every admin API handler must check a specific RBAC
 * permission (not merely that someone is logged in). The only exceptions are listed
 * explicitly with the reason. A new admin route without a permission check fails this test.
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.join(__dirname, '../../../app/api/admin')
// Self-service: any signed-in admin manages their own two-factor settings.
// OAuth callback: protected by the single-use `state` cookie checked inside the handler.
const EXCEPTIONS: Record<string, string> = {
  '2fa/setup': 'self-service', '2fa/enable': 'self-service', '2fa/disable': 'self-service',
  'google-ads/callback': 'OAuth callback, state-cookie verified',
}
const HANDLER = /export async function (GET|POST|PUT|PATCH|DELETE)\b/g

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name === 'route.ts') out.push(p)
  }
  return out
}

describe('admin API authorization coverage', () => {
  const files = walk(ROOT)
  it('finds the admin route files', () => { expect(files.length).toBeGreaterThan(50) })

  it.each(files.map((f) => [path.relative(ROOT, path.dirname(f)) || '/', f]))('%s checks a permission', (rel, file) => {
    if (EXCEPTIONS[rel as string]) return
    const src = fs.readFileSync(file as string, 'utf8')
    const handlers = [...src.matchAll(HANDLER)]
    if (handlers.length === 0) return
    // Each handler body must reference hasPermission (checked per-handler, not per-file).
    const bodies = handlers.map((m, i) => src.slice(m.index!, i + 1 < handlers.length ? handlers[i + 1].index! : src.length))
    for (const b of bodies) {
      // Accepted forms: an inline hasPermission(...) call, or a file-local guard() helper that wraps it.
      expect(b.includes('hasPermission(') || (b.includes('await guard(') && src.includes('hasPermission('))).toBe(true)
    }
  })
})

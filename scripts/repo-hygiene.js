#!/usr/bin/env node
// Repo hygiene check — runs automatically before `npm run build` (prebuild hook).
//
// Why this exists: when a new version of the project is copied OVER an old git
// checkout (instead of replacing it), files that were renamed/removed in the new
// version stay behind. That broke a real Hostinger build:
//   "Already included file name .../Footer.tsx differs from .../footer.tsx only in casing"
// and left old, type-broken files (components/agency/*, lib/bi/*, sentry.client.config.ts…)
// that the new tsconfig no longer excludes.
//
// What it does (and ONLY this):
//   1. Deletes the specific, known-obsolete files below, if they exist at their old path
//      (the same files now live under archive/unused/). Matching is by EXACT directory
//      entry name, so a case-insensitive file system (Windows/macOS) can never cause the
//      wrong file to be deleted.
//   2. Deletes components/layout/footer.tsx ONLY when BOTH Footer.tsx and footer.tsx exist
//      as separate entries (impossible on Windows/macOS, a real conflict on Linux).
//   3. Fails the build with a clear message if any OTHER pair of files in the source
//      folders differs only by letter case (cannot be resolved automatically).
// To fix your GitHub repo permanently, delete the same files there (see DEPLOY_HOSTINGER.md §1).

const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')

const OBSOLETE = ["app/mobile/enhanced-app.tsx", "components/agency/ClientCard.tsx", "components/agency/InvoiceTemplate.tsx", "components/agency/ProjectCard.tsx", "components/agency/ProjectGallery.tsx", "components/agency/QuoteForm.tsx", "components/agency/TaskBoard.tsx", "lib/ai/chatbot-enhanced.ts", "lib/ai/predictive.ts", "lib/ai/recommendations.ts", "lib/bi/analytics.ts", "lib/bi/dashboard.ts", "lib/bi/reports.ts", "lib/indexer.ts", "lib/monitoring.ts", "lib/multi-tenant/tenant-management.ts", "lib/search-service.ts", "tailwind.config.ts", "sentry.client.config.ts"]

function entries(dir) {
  try { return fs.readdirSync(dir) } catch { return [] }
}

const removed = []
for (const rel of OBSOLETE) {
  const dir = path.join(root, path.dirname(rel))
  const name = path.basename(rel)
  if (entries(dir).includes(name)) {
    fs.unlinkSync(path.join(root, rel))
    removed.push(rel)
  }
}

// Footer.tsx / footer.tsx duplicate (Linux only)
{
  const dir = path.join(root, 'components', 'layout')
  const list = entries(dir)
  if (list.includes('Footer.tsx') && list.includes('footer.tsx')) {
    fs.unlinkSync(path.join(dir, 'footer.tsx'))
    removed.push('components/layout/footer.tsx (duplicate of Footer.tsx)')
  }
}

// Remaining case-only duplicates: cannot be fixed automatically
const conflicts = []
function scan(dir) {
  const list = entries(dir)
  const seen = new Map()
  for (const name of list) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue
    const k = name.toLowerCase()
    if (seen.has(k)) conflicts.push(path.relative(root, path.join(dir, seen.get(k))) + '  <->  ' + path.relative(root, path.join(dir, name)))
    else seen.set(k, name)
    const full = path.join(dir, name)
    try { if (fs.statSync(full).isDirectory()) scan(full) } catch {}
  }
}
for (const d of ['app', 'components', 'lib', 'services', 'hooks', 'prisma', 'scripts', 'types']) scan(path.join(root, d))

if (removed.length) {
  console.warn('\n⚠️  repo-hygiene: removed obsolete files left over from an older version:')
  for (const r of removed) console.warn('   - ' + r)
  console.warn('   Delete them from your GitHub repo too (git rm) so this warning disappears.\n')
}
if (conflicts.length) {
  console.error('\n❌ Files whose names differ only by letter case (breaks the build on Linux):')
  for (const c of conflicts) console.error('   ' + c)
  console.error('   Keep one of each pair:  git rm <the unwanted file>   (then commit and push)\n')
  process.exit(1)
}
console.log('✅ repo-hygiene check passed')

#!/usr/bin/env node
// Pre-start environment check. `npm start` runs it automatically (prestart).
// Exits 1 ONLY for settings without which the site cannot run safely;
// everything else prints a warning and the site still starts.
const env = process.env
const errors = [], warnings = []
const isProd = env.NODE_ENV === 'production'

if (!env.DATABASE_URL) errors.push('DATABASE_URL is not set (mysql://USER:PASSWORD@HOST:3306/DBNAME)')
else if (!/^mysql:\/\//.test(env.DATABASE_URL)) errors.push('DATABASE_URL must start with mysql://')

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) errors.push('JWT_SECRET must be set and at least 32 characters (admin login tokens are signed with it)')

if (!env.ADMIN_PATH) warnings.push('ADMIN_PATH is not set — the admin panel will use the default /admin path (set a private slug)')
if (env.NEXT_PUBLIC_ADMIN_PATH) warnings.push('NEXT_PUBLIC_ADMIN_PATH is set — it is no longer used and would expose the admin path to browsers; delete it and use ADMIN_PATH')
if (isProd && !env.TWO_FACTOR_ENCRYPTION_KEY && !env.JWT_SECRET) errors.push('TWO_FACTOR_ENCRYPTION_KEY (or JWT_SECRET) is required in production')
if (!env.TWO_FACTOR_ENCRYPTION_KEY) warnings.push('TWO_FACTOR_ENCRYPTION_KEY not set — 2FA secrets will be encrypted with JWT_SECRET (works, but a separate key is better)')
if (!env.STRIPE_WEBHOOK_SECRET && env.STRIPE_SECRET_KEY) warnings.push('STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is not — Stripe webhooks will be rejected (503) and orders will not be marked paid')
if (!env.SMTP_USER || !env.SMTP_PASS) warnings.push('SMTP_USER/SMTP_PASS not set — contact-form and booking emails will not be sent')
if (!env.NEXT_PUBLIC_SITE_URL) warnings.push('NEXT_PUBLIC_SITE_URL not set — sitemap.xml and robots.txt will use the default domain')
if (!env.CRON_SECRET) warnings.push('CRON_SECRET not set — background jobs endpoint (/api/jobs/run) is disabled')
if (!env.R2_PUBLIC_URL) warnings.push('R2_PUBLIC_URL not set — Cloudflare R2 images will not load through next/image')
if (!env.SENTRY_DSN) warnings.push('SENTRY_DSN not set — error/performance monitoring is off')
if (!env.GEMINI_API_KEY) warnings.push('GEMINI_API_KEY not set — AI agents/chat/RAG are disabled')

for (const w of warnings) console.warn('⚠️  ' + w)
if (errors.length) {
  console.error('\n❌ Cannot start — fix these environment variables:')
  for (const e of errors) console.error('   • ' + e)
  process.exit(1)
}
console.log('✅ Environment check passed' + (warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : ''))

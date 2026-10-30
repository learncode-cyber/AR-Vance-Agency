# STATUS — evidence-based

Legend: IMPLEMENTED (code exists) · VERIFIED (tested successfully) · PARTIALLY VERIFIED · UNVERIFIED · BLOCKED

## Security (Phase 2)
- S1 Admin reads (92 handlers) only checked "logged in", not a permission → VERIFIED by static coverage test (110 cases) across all admin routes; one exception list (2FA self-service, Google OAuth callback with state cookie). Runtime role test: see FINAL_PRODUCTION_AUDIT.md.
- S2 Leads list/detail readable without CRM permission → VERIFIED (code + coverage test).
- S3 Stripe webhook signature + replay window → VERIFIED (unit, 7 cases) and runtime (earlier round).
- S4 Cart item IDOR → VERIFIED (runtime, earlier round).
- S5 Critical Next.js RCE advisory (GHSA-2464-fhr4-w9xw, Image Optimization with SVG; affects ≤15.5.27) → FIXED by upgrading to Next 15.5.28; build verified.
- S6 Fake crypto wallet addresses (funds would be lost) → DISABLED (501).
- S7 Empty AI stub routes reporting success → now 501 "not implemented".
- S8 Admin webhook secret used Math.random → replaced with crypto.randomBytes.

## Business logic
- Stock reservation on order (atomic) → VERIFIED (runtime, earlier round, race test).
- Booking double-booking protection → VERIFIED (runtime, earlier round).
- Tax/shipping configurable via env → IMPLEMENTED (defaults unchanged; business must confirm).
- Affiliate commissions (pending→approved on payment, paid/reversed by admin) → IMPLEMENTED; unit-tested (session, commission math); runtime end-to-end UNVERIFIED in this round.
- Invoices (numbering, status flow, PDF, email) → IMPLEMENTED; unit-tested; runtime UNVERIFIED in this round.
- Exports PDF/XLSX/CSV/DOCX → IMPLEMENTED; file-format tests + manual PDF rendering check.

## Content and SEO
- Fictional testimonials, case studies, team profiles, headline stats → REMOVED from default seed (only with SEED_DEMO_CONTENT=true).
- Homepage "24 AI agents" claim → REMOVED (replaced with "AI-assisted agency tools").
- Per-service detail pages (/services/[slug]) → IMPLEMENTED; build verified.
- Page metadata on previously untitled public pages → IMPLEMENTED; noindex on private pages.
- Domain: all site URLs use https://arvanceagency.com; the remaining "arvance.agency" strings were email addresses and are now env-driven.

## Build and tests (final tree)
- TypeScript: 0 errors.
- Jest: 282 passed / 282 (27 suites).
- ESLint: 0 errors, 301 warnings (documented; mostly `any` and unused variables).
- Production build (low-memory script, type-check run separately): exit 0.
- Lockfile consistency (npm ci dry run): exit 0.

## Integrations
- AI provider (Gemini): code IMPLEMENTED; live call UNVERIFIED (no key in this environment).
- Email (SMTP): nodemailer 10 verified against a local SMTP server (send + header-injection guard); real provider UNVERIFIED.
- Stripe: webhook verification VERIFIED; checkout payments NOT implemented (orders are payment-pending).
- Cloudflare R2, Redis, Elasticsearch, Sentry, Meta/GA4: code present; UNVERIFIED (no service credentials).

## Deployment
- Hostinger: BLOCKED (no account, DNS or database access). Deployment package and steps: DEPLOY_HOSTINGER.md.

## Runtime verification (production build, real MariaDB 10.11, `npm start`)
Test copy used a test-only Prisma driver adapter because the sandbox cannot download the Prisma engine; shipped configuration is unchanged.
- Smoke 01 auth + leads pagination: 15/15 (VERIFIED)
- Smoke 02 admin CRUD, search, public team page: 40/40 (VERIFIED)
- Smoke 04 rate limits (per-key 3/hour → 429, login brute force → 429): 4/4 (VERIFIED)
- Smoke 05 public pages, sitemap, robots, admin-path hiding: 13/15 — /portfolio does not list the smoke PortfolioItem because the public portfolio reads featured Project rows (OPEN PRODUCT DECISION, see PLANNING.md); /admin/login correctly 404 under custom ADMIN_PATH.
- Role authorization (Editor vs Admin, real sessions): 12/12 (VERIFIED) — Editor denied leads, users, invoices, affiliates (403); anonymous denied (401); admin allowed.
- Smoke 03 2FA + API keys + jobs: 25/29 — the 4 failures are the per-account login lockout triggered by repeated logins inside one run (working brute-force protection), not a functional defect; 2FA/backup-code logic is covered by unit tests.

## Launch-blocking defects fixed in this round
- `npm start` exited immediately (standalone output with `next start`). Fixed: plain `next start -p $PORT`.
- Public content pages were frozen at build time (admin edits not visible without a rebuild). Fixed: revalidate 60 on server-rendered content pages.
- Build failure from revalidate on client components. Fixed (removed from client pages).

## Business-flow runtime verification (production build, real MariaDB, `npm start`)
- Affiliate: verify token (single use), sign-in link (single use, 15 min), session cookie (signed, forged rejected), dashboard data, referral cookie, generic 202 on sign-in email (no account enumeration): VERIFIED.
- Commission: 10% of subtotal after discount recorded as pending; self-referral and unverified-affiliate codes earn nothing: VERIFIED.
- Admin commission flow: pending→approved→paid; paid→reversed refused (409); pending→paid refused (409): VERIFIED.
- Invoices: numbering, totals (1000 − 50 + 10% = 1045), real PDF download, send without SMTP fails honestly (502, status unchanged), paid→void refused (409): VERIFIED. Email delivery of the invoice: UNVERIFIED (no SMTP).
- Report exports: CSV (with BOM), PDF, XLSX and DOCX each return the correct file signature: VERIFIED.
- Editor role denied invoices (403): VERIFIED.
- Smoke 01 (auth, leads pagination): auth and pagination VERIFIED; the leads-count assertions fail only because leads from earlier runs remain in the test database (suite expects an empty DB).
- Role test: 12/12 VERIFIED.

# FINAL PRODUCTION AUDIT — AR Vance Agency OS

Canonical domain: https://arvanceagency.com
Deployment status: **BLOCKED — live Hostinger deployment not performed** (no account, DNS or production database access). Project is **DEPLOYMENT READY — LIVE VERIFICATION PENDING** for the code and build; see the blockers at the end.

## 1. What was audited
- Repository structure, planning documents, dependency manifest and lockfile consistency.
- All 100+ admin API handlers for authorization.
- All public pages for metadata, content and dead links.
- The AI worker and agent inventory (docs/AI_WORKER_AUDIT.md).
- Production dependencies (docs/DEPENDENCY_AUDIT.md).
- Runtime behaviour on a production build against MariaDB 10.11.

## 2. What was fixed (this round)
| Area | Defect | Fix | Evidence |
|---|---|---|---|
| Authorization | 92 admin handlers verified login only, not permission | Permission check per area; 2FA and OAuth callback excepted | Static coverage test (110 cases); runtime Editor test 12/12 |
| Leads | Any admin could read all leads | Requires manage_crm (list + detail) | Runtime 403 for Editor |
| Dependencies | next 15.5.27 has critical RCE (GHSA-2464-fhr4-w9xw) | Upgraded to 15.5.28 | Build exit 0; audit critical → 0 |
| Launch | `npm start` exited immediately (standalone output) | Plain `next start -p $PORT` | Runtime boot via npm start |
| Content | Public pages frozen at build time | revalidate 60 on server-rendered pages | Build verified |
| Content | Fictional reviews, case studies, team, stats | Gated behind SEED_DEMO_CONTENT (off by default) | Seed code; removed from production path |
| AI | Stub routes returned empty success; homepage claimed 24 agents | Stubs return 501; claim replaced | Runtime 501 check |
| Crypto | Fake wallet addresses (funds could be lost) | Routes disabled (501) | Code |
| Security | Admin webhook secret used Math.random | crypto.randomBytes | Code |
| Config | Tax, shipping, admin/contact emails hard-coded | Env-driven (ORDER_TAX_RATE_PERCENT, ORDER_FLAT_SHIPPING, SEED_ADMIN_EMAIL, SEED_CONTACT_EMAIL) | Code |
| Domain | Mixed domains | Site URLs use https://arvanceagency.com; remaining addresses are env-driven | grep audit |
| Affiliate | Demo dashboard and demo admin page; no real commissions | Real sign-in, referral tracking, commissions, admin management | Unit tests; affiliate DB flow NOT runtime-tested |
| Build | Revalidate on client components broke build | Removed from client pages | Build exit 0 |
| Scripts | DDL generator and seed had path/exit bugs | Fixed | Ran successfully |

## 3. Tests run (final tree)
- TypeScript: 0 errors.
- Jest: 282 / 282 passed (27 suites), including the authorization coverage guard.
- ESLint: 0 errors; 301 warnings (documented, mostly `any` and unused variables).
- Production build: exit 0 (type-check and lint run separately, per the low-memory script).
- Lockfile consistency (npm ci dry run): OK.
- Runtime (production server on MariaDB): smoke 01 15/15, 02 40/40, 04 4/4, 05 13/15 (portfolio decision + admin-path expectation), role test 12/12, smoke 03 25/29 (login-lockout artifact of the suite itself).

## 4. AI Worker / Agent status (summary; full table in docs/AI_WORKER_AUDIT.md)
- 6 registry agents (lead intelligence, analytics, content strategy, SEO advisor, business audit, proposal drafter): code and tool/permission/timeout/audit paths VERIFIED in unit tests. **Live model execution UNVERIFIED — no Gemini key.**
- 26 class-based agents: 5 reachable through /api/agents; live execution UNVERIFIED; 21 are not reachable from any route (dormant, not advertised).
- Predictions, recommendations, sentiment, chatbot: NOT IMPLEMENTED (501).

## 5. Database and migrations
- Schema validated; test database created from the current schema (236 tables) with zero DDL errors.
- Seed runs cleanly; demo content only with SEED_DEMO_CONTENT=true.
- Production: run `npx prisma db push` after a verified backup. New tables/columns: Invoice, Affiliate, AffiliateCommission, Order.affiliateCode, Affiliate sign-in fields, Lead indexes. No destructive change; do NOT use --accept-data-loss.
- Migration rollback: restore the pre-change backup. Schema changes are additive.
- The test-only Prisma driver adapter is NOT part of the shipped configuration; production uses Prisma's default engine, which was not exercised in this sandbox (download blocked).

## 6. External integrations
| Integration | Status |
|---|---|
| Gemini AI | UNVERIFIED (no key) |
| SMTP email | nodemailer verified against a local SMTP server; real provider UNVERIFIED |
| Stripe webhook | Signature and replay window VERIFIED (unit + earlier runtime); checkout payments NOT implemented |
| Cloudflare R2, Redis, Elasticsearch, Sentry, Meta/GA4, Google Ads | Code present; UNVERIFIED (no credentials) |

## 7. Hostinger compatibility
- Node 22, npm ci with --legacy-peer-deps --include=dev, `npm run build` (or build:lowmem if memory is limited), `npm start`.
- The app does not use standalone output; `next start -p $PORT` is used.
- Not verified: the actual Hostinger runtime, its memory limit during build, and its process restart behaviour.

## 8. Canonical domain
- All site URLs and sitemap entries use https://arvanceagency.com.
- Email addresses are supplied by env; none are assumed.
- Not verified: DNS, HTTPS and redirects for arvanceagency.com (no DNS access).

## 9. Remaining limitations and risks (honest)
1. Live deployment and live-domain verification: BLOCKED (needs Hostinger access).
2. Online card payments: not implemented. Orders stay payment-pending. Crypto payments disabled.
3. Affiliate payouts: manual. Commissions are approved/paid by an admin; no payout collection.
4. Public portfolio shows featured Project rows; admin edits PortfolioItem rows. Needs a product decision.
5. Real testimonials, case studies, team profiles and metrics must be supplied by the owner.
6. Homepage now says "AI-assisted agency tools". Only 6 agents are operational; live AI is unverified.
7. Next.js moderate/high advisories (next, postcss via build tooling) remain; the fix requires the Next 16 migration (see NEXT16_PLAN.md). Not a launch blocker; scheduled.
8. exceljs/uuid moderate advisory: only fix is a breaking downgrade; the vulnerable path is not used.
9. Browser E2E (Playwright) not run; visual and mobile QA not performed.
10. CSP remains Report-Only; enforce only after reviewing real violations.
11. Smoke suite 03 needs a clean login-lockout window (test sequencing).
12. Test credentials in scripts/runtime-smoke are test-only; never reuse them in production.

## 10. Exact deployment steps (Hostinger)
1. Take a full MySQL backup from hPanel.
2. Replace the GitHub repository contents with this release (do not copy over old files). Use `git config core.ignorecase false` on Windows/macOS.
3. Create the Node.js app: Node 22; Install `npm install --legacy-peer-deps --include=dev`; Build `npm run build` (fallback `npm run build:lowmem`); Start `npm start`.
4. Set environment variables from `.env.example`: DATABASE_URL, NEXT_PUBLIC_SITE_URL=https://arvanceagency.com, JWT_SECRET (32+), ADMIN_PATH, TWO_FACTOR_ENCRYPTION_KEY, CRON_SECRET, SEED_ADMIN_EMAIL (first run only), SEED_ADMIN_PASSWORD (first run only), SMTP_*, ORDER_TAX_RATE_PERCENT, ORDER_FLAT_SHIPPING, and any integration keys actually used.
5. From the project folder: `npx prisma db push` (after backup). Then `npm run prisma:seed` (first run only, then unset SEED_ADMIN_PASSWORD). Then `npm run rbac:sync`.
6. Start the app. Check `https://arvanceagency.com/api/health` returns `{"status":"ok","db":true}`.
7. Log in at `/<ADMIN_PATH>/login`, change the admin password, enable 2FA.
8. Smoke check: home, services and one service page, contact form (lead appears), affiliate sign-in page, admin Leads (CRM permission), admin Invoices.
9. Schedule the job runner every minute: `curl -fsS -X POST https://arvanceagency.com/api/jobs/run -H "x-cron-secret: $CRON_SECRET"`.

## 11. Rollback
- Code: redeploy the previous release archive.
- Database: restore the backup taken in step 1. Schema changes are additive, so old code runs against the new schema.

## 12. Deployment status
DEPLOYMENT READY — LIVE VERIFICATION PENDING. Hostinger deployment: BLOCKED (access required). Owner decisions required before launch: domain confirmation, payment provider, tax and shipping values, real testimonials/case studies/team, AI claim wording, portfolio model.

## Addendum — business-flow runtime tests (this round)
Affiliate sign-in, referral commissions, admin commission approval/payout, invoices (number, totals, PDF, status rules) and all four report export formats were run against the production server on a real MariaDB database: 33 of 34 checks passed. The one failure was a test-script error (the test activated the affiliate it was checking as "pending"); the rule was re-tested on a fresh unverified affiliate and passed (0 commissions).
Still UNVERIFIED: email delivery (SMTP), Stripe/online payment (not implemented), live AI, browser UI.

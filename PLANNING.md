# AR Vance Agency OS — Authoritative Plan

Canonical production domain: https://arvanceagency.com
Parent company attribution: AR Qudrix ("A Digital & Technology Company by AR Qudrix")
Agency attribution: "Designed & Developed by AR Vance Agency"
Deployment target: Hostinger Business (Node.js 22, managed MySQL)

## Phases and status

| Phase | Scope | Status |
|---|---|---|
| 1 | Repository and architecture audit | VERIFIED (build, tests, tsc, eslint, audit run on the final tree) |
| 2 | Critical defects and security remediation | IMPLEMENTED + PARTIALLY VERIFIED (see STATUS.md, items S1–S8) |
| 3 | AI worker/agent audit and completion | VERIFIED for the 6 registered agents' code paths in unit tests; LIVE provider UNVERIFIED (no Gemini key). Other agent code: see docs/AI_WORKER_AUDIT.md |
| 4 | Full-stack and workflow completion | IMPLEMENTED; runtime checks partial (see STATUS.md) |
| 5 | Domain, content, production configuration | IMPLEMENTED (domain, demo-content gating, env-driven emails) |
| 6 | Comprehensive testing | PARTIALLY VERIFIED (unit/static: 282 tests; runtime against MariaDB: smoke scripts; browser E2E: NOT run) |
| 7 | Hostinger deployment | BLOCKED — no access to the Hostinger account, DNS, or production database |
| 8 | Final verification and delivery | IMPLEMENTED (ZIP, audit documents); live verification pending Phase 7 |

## Open decisions for the owner
1. Online card/crypto payment provider (none is connected; checkout orders stay payment-pending; crypto routes are disabled).
2. Tax rate and shipping fee (currently 10% and $50 defaults via ORDER_TAX_RATE_PERCENT / ORDER_FLAT_SHIPPING).
3. Real client testimonials, case studies and team profiles (fictional seed content removed; not invented).
4. Official contact and admin email addresses (env: SEED_ADMIN_EMAIL, SEED_CONTACT_EMAIL).
5. Whether to keep the six operational AI agents as the public claim (homepage now says "AI-assisted agency tools").
6. Next.js 16 migration (see NEXT16_PLAN.md) — deferred; not a launch blocker.

## Out of scope for this release
- Affiliate payout execution (commissions are approved/paid manually by an admin).
- Full browser end-to-end suite (Playwright specs exist but were not executed in this environment).

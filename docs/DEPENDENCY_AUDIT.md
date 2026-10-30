# Dependency Audit (production dependencies)

Measured with `npm audit --omit=dev` on the final tree.

| Package | Severity | Status | Action / remaining risk |
|---|---|---|---|
| next (was 15.5.27) | CRITICAL (GHSA-2464-fhr4-w9xw, image optimisation RCE with SVG) | FIXED | Upgraded to 15.5.28 (patch, same major). |
| next | moderate (range to 16.3.0-preview) | ACCEPTED RISK | Fix requires Next 16.4 (major migration, see NEXT16_PLAN.md). Not a launch blocker. |
| postcss (bundled in next) | high (CSS source-map / stringify issues) | ACCEPTED RISK | Build-time CSS tooling; this app does not parse untrusted CSS at runtime. Fixed by the same Next 16 migration. |
| exceljs | moderate (inherits uuid < 11.1.1) | ACCEPTED RISK | Only fix is exceljs 3.4.0 (a downgrade, breaking). The vulnerable uuid path (v3/v5/v6 with a caller-supplied buffer) is not called by this app. |
| nodemailer | was moderate | FIXED | Upgraded to 10.1.0 (header-injection guard added in sendEmail). |
| sharp | was high | FIXED | Upgraded to 0.35.5. |
| jspdf, xlsx, puppeteer, jimp, uuid (direct), crypto-js | various | REMOVED | Confirmed unused by live code. PDF and Excel now use pdfkit, exceljs, docx. |

Dev-only findings (eslint, jest, typescript toolchain) are not shipped to production.

Re-run before each release: `npm audit --omit=dev`.


## Upgrade phase 1 (duplicate project, Oct 24 2026)
Applied in-range minor/patch updates only (no major versions): @google/genai 2.31.0, nodemailer 10.2.1, @sentry/nextjs 11.9.0, @playwright/test 1.64.1, @aws-sdk/client-s3 3.1156.0.
Verified: prisma generate OK, tsc 0 errors, jest 282/282, production build exit 0.
Remaining advisories after phase 1:
- zod 3.25.x (high, direct): memory exhaustion on oversized constrained collections, fixed in zod 4.6.6+. Fix requires the Zod 4 major upgrade (phase 3). Mitigation: request arrays already have max() limits in most schemas.
- next 15.5.28 (moderate) and postcss (high, transitive): fixed only by Next 16 (phase 2).
- exceljs / uuid (moderate): no non-breaking fix (see above).

## Upgrade phase 2 (Next 16 + React 19 + ESLint 10)
Changes: next 15.5.28 -> 16.4.3; react and react-dom 18.2 -> 19.3.1; @types/react 19; eslint-config-next 16.4.3; eslint 10.13 with a flat config (eslint.config.mjs) replacing .eslintrc.json; the `eslint` build key removed (Next 16 no longer lints during build; run `npm run lint`).
Lint: 0 errors. Three React Compiler rules (react-hooks/immutability, set-state-in-effect, purity) are warnings for now (about 73 findings across admin pages), to be fixed component by component.
Verified: prisma generate, tsc 0 errors, jest 282/282, production build (Turbopack) exit 0, runtime on a production server against MariaDB: role/authorization 12/12, admin CRUD and auth flows pass when test data is fresh (the remaining failures in the runs were leftover test data, not code).
Known follow-ups: middleware.ts shows a deprecation warning (rename to proxy.ts via the Next codemod); zod still needs the Zod 4 upgrade (phase 3).


## Upgrade phase 3 (Prisma 7, Zod 4, Jest 30, Recharts 3)
Changes: prisma and @prisma/client 7.10.1 (stable; 8.x is still a release candidate), @prisma/adapter-mariadb 7.10.1 now used in production (lib/prisma.ts); the database URL moved from schema.prisma to prisma.config.ts; zod 4.6.7 (.errors renamed to .issues across the code); jest 30.5.2 with jest-environment-jsdom 30 and Testing Library 16; recharts 3.10.1; middleware.ts renamed to proxy.ts (Next 16 convention).
Code fixes made while upgrading: a browser-side call to the database in the public team page was removed (it would have failed at runtime); Recharts 3 callback types adapted in the analytics page.
Verified: tsc 0 errors, eslint 0 errors, jest 282/282, production build (Turbopack) exit 0. Runtime on a production server against MariaDB through the Prisma 7 adapter: health ok, role/authorization 12/12, admin CRUD 40/40, auth 15/15, affiliate/commission/invoice/export flows 33/34 (the one failure is the known test-fixture artifact).
Remaining advisories: check the audit output above; the zod advisory is fixed by this phase.


## Styling fix (local screenshot verified)
Root cause: the markup of 61 files uses Tailwind utility classes (961 uses), but Tailwind was not installed, so pages rendered as plain text. Fixed by installing tailwindcss v4 with @tailwindcss/postcss, adding postcss.config.mjs, importing Tailwind and brand colour scales (navy, gold, emerald) in app/globals.css.
Also fixed: navbar styles were missing (classes .navbar, .navbar-links, .burger, .navbar-cta) and were added to globals.css; burger bars styled; mobile header fits on 390px screens.
Removed: a homepage stats block with unverifiable figures (24 AI agents, 60+ models, 240+ routes, 100%).
Verified in a headless Chromium (screenshots in outputs): stylesheet loaded, logo loaded at 500x500 source, header shows AR Vance Agency, Free SEO Audit button, desktop and mobile layouts.


## Browser verification (headless Chromium, local production server)
Screenshots: proof-homepage-desktop.png, proof-homepage-mobile.png, proof-services.png, proof-admin-login.png.
Fixed in this round: undefined custom classes (admin, forms, sections, blog, team, contact, CTA, services grid) added to globals.css; admin login and sidebar brand corrected (was DigitalArch); database-driven public pages set to dynamic so build-time empty lists cannot be frozen into HTML; test-only data removed from the test database.
Known remaining: the homepage hero primary button still uses the shared Button component whose utility classes render with reduced padding; about and blog detail pages and the admin dashboard were not screenshotted in this round.

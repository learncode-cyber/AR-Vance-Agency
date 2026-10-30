# Next.js 16 compatibility plan

**Status: NOT migrated.** Production stays on Next 15.5.x (patched line). This plan is based on a real trial in an isolated copy of the project (Oct 6 2026), not on release notes alone.

## What was tested (copy of this repo, `next@16.3.8`, `eslint-config-next@16.3.8`)
| Check | Result |
|---|---|
| Peer dependencies | `next@16.3.8` accepts React `^18.2.0 \|\| ^19`, so **no React upgrade is needed**. `@sentry/nextjs@11.4` declares support for Next 16. Node `>=20.9` required (project targets 22). |
| `tsc --noEmit` | 1 error: the `eslint` key no longer exists in `NextConfig` |
| `next build` (Turbopack, now the default) | Compiled successfully in 67s; **332 routes, identical to the Next 15 build** |
| Jest | all suites passed in the copy (128 tests) |
| ESLint | **fails to load** with the legacy config (see required change 2) |
| Warning | `middleware` file convention is deprecated → rename to `proxy` |

## What was NOT tested
Runtime behaviour in a browser, authentication/cookies/redirects under `proxy.ts`, image optimisation, Sentry source-map upload, Hostinger's Node runtime, and the build's page-data step against a real database (sandbox has no DB). Treat the migration as unverified until those are checked on a staging deploy.

## Required changes (found by the trial)
1. `next.config.ts`: delete the `eslint: { ignoreDuringBuilds }` block (removed in 16; the build no longer lints).
2. **Lint must be reconfigured (found by the trial, it breaks).** `"lint": "next lint"` is removed in 16, and with `eslint-config-next@16` the current legacy `.eslintrc.json` (`extends: ["next/core-web-vitals", ...]`) **fails to load** (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Plan: move to ESLint's flat config (`eslint.config.mjs`, per the `eslint-config-next` 16 docs; likely with ESLint 9), set `"lint": "eslint ."`, and re-check the rule overrides from `.eslintrc.json`. Until that's done, lint (and `npm run lint` in CI) is unusable on 16. Not attempted in the trial.
3. `middleware.ts` → `proxy.ts` (codemod: `npx @next/codemod@canary middleware-to-proxy .`). It carries the admin-path guard and request-ID logic, so test: admin path redirect, unauthenticated redirect, `x-request-id` header on `/api/*`.
4. Turbopack is the default bundler. `experimental.webpackMemoryOptimizations` is a webpack option; keep it only if building with `--webpack`.
5. `tsconfig.json`: Next rewrites `jsx` to `react-jsx` and adds `.next/dev/types/**/*.ts` to `include` automatically — commit the result.

## Things to review (not failing today, but changed in 16)
- `next/image` defaults changed (cache TTL, allowed `qualities`, local-image query strings). Re-check product/blog images and the R2 host pattern.
- Any `revalidateTag` calls need the new signature (none found in this codebase).
- Async request APIs (`cookies()`, `headers()`, `params`) are already awaited here.

## Suggested order
1. Deploy the current 15.5.x build to Hostinger and confirm it is stable (1–2 weeks). Collect `[csp-violation]` logs.
2. On a branch: apply the 3 required edits above, `npm i next@16 eslint-config-next@16 --legacy-peer-deps`.
3. Staging deploy: run the E2E suite (`npm run test:e2e`) and manually check admin login (+2FA), contact form, checkout, blog images.
4. Compare build time/memory on Hostinger against 15.5. Turbopack compiled faster here (67s vs ~105s), but this was measured on one machine only.
5. Roll out; keep the 15.5.x tag ready for instant rollback.

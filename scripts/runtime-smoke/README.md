# Runtime smoke tests (real database, real HTTP)

These scripts hit a **running** app + a **real MariaDB/MySQL** — they caught bugs that unit tests, `tsc`, and `next build` could not (see AUDIT_REPORT.md, Round 8). They create test rows (users, leads, services…) so run them only against a throw-away database.

## How they were run (Oct 2026, sandbox without Prisma engine downloads)
1. Throw-away DB: `CREATE DATABASE arvance;` + a user.
2. Tables: `node scripts/runtime-smoke/schema-to-mysql-ddl.js` writes `./schema.sql` from `prisma/schema.prisma` (the sandbox could not run `prisma db push`; **on your own machine just use `npx prisma db push`** and skip this step).
3. Seed: `npx prisma db seed` with `SEED_ADMIN_PASSWORD='Adm1n!Test#2026'`.
4. Start the app (`npm run dev -- -p 3100`) with `DATABASE_URL`, `JWT_SECRET` (≥32 chars), `TWO_FACTOR_ENCRYPTION_KEY`, `ADMIN_PATH=kali_master`, `CRON_SECRET=cron-secret-for-tests-1234567890`.
5. Run in order: `python3 scripts/runtime-smoke/01_auth_leads.py` … `05_public_pages.py`. Scripts assume the admin password above and a fresh server (the login/API-key rate limiters are in-memory; restart the server between 03 and 04 if you hit 429).

Note: in the sandbox the app ran on a Rust-free Prisma client with the MariaDB driver adapter (`engineType = "client"`); the shipped config uses the default engine.

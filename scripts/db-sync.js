#!/usr/bin/env node
// Runs before `npm start` ONLY when DB_AUTO_SYNC=true (first deploy / schema upgrade).
//  - `prisma db push` without --accept-data-loss: it refuses destructive changes, so it cannot drop data.
//  - Seeds the first admin + default roles only when SEED_ADMIN_EMAIL is set (seed is idempotent).
// Unset DB_AUTO_SYNC after a successful run so normal restarts stay fast and read-only.
const { execSync } = require('child_process')
if (process.env.DB_AUTO_SYNC !== 'true') {
  console.log('db-sync: skipped (DB_AUTO_SYNC not set)')
  process.exit(0)
}
if (!process.env.DATABASE_URL) {
  console.error('db-sync: DATABASE_URL is missing')
  process.exit(1)
}
try {
  console.log('db-sync: applying schema (additive only)…')
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' })
  if (process.env.SEED_ADMIN_EMAIL) {
    console.log('db-sync: seeding default roles and admin…')
    execSync('npx ts-node --compiler-options \'{"module":"commonjs"}\' prisma/seed.ts', { stdio: 'inherit' })
  }
  console.log('db-sync: done. Remove DB_AUTO_SYNC from the environment now.')
} catch (e) {
  console.error('db-sync: failed — the application will not start until this is fixed.')
  process.exit(1)
}

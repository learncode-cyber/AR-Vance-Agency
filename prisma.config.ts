import { defineConfig } from 'prisma/config'

// When prisma.config.ts exists the Prisma CLI does NOT load .env on its own
// ("Prisma config detected, skipping environment variable loading"), so
// `prisma db push` / `prisma db seed` run on your own computer would not see
// DATABASE_URL. Load it here (Node 22 built-in; harmless if .env is absent, and
// on Hostinger the real environment variables are already set).
try { process.loadEnvFile('.env') } catch { /* no .env file */ }

// Replaces the deprecated package.json "prisma" field (removed in Prisma 7;
// confirmed from the config types actually shipped in node_modules/@prisma/config,
// not guessed) — this is the modern equivalent.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: "ts-node --compiler-options '{\"module\":\"commonjs\"}' prisma/seed.ts",
  },
})

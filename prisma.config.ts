import { defineConfig } from 'prisma/config'

// Replaces the deprecated package.json "prisma" field (removed in Prisma 7;
// confirmed from the config types actually shipped in node_modules/@prisma/config,
// not guessed) — this is the modern equivalent.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: "ts-node --compiler-options '{\"module\":\"commonjs\"}' prisma/seed.ts",
  },
})

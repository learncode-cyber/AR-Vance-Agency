/**
 * The public URL path for the admin panel — e.g. "kali_master" means the
 * panel lives at /kali_master instead of /admin. Change it anytime by
 * updating ADMIN_PATH in your environment and restarting the app — no
 * code changes or rebuild-from-source needed (a redeploy/restart that
 * picks up the new env var is enough).
 *
 * Deliberately NOT NEXT_PUBLIC_* — Next.js inlines any NEXT_PUBLIC_ var
 * into client bundles at build time, which would leak the slug into JS
 * anyone can read, defeating the point of hiding the panel. This module
 * is for server-only code (e.g. app/robots.ts, API routes). Client
 * components that need to build a link within the admin panel should
 * derive the current path segment from usePathname() at runtime instead —
 * see components/admin/AdminSidebar.tsx for the pattern.
 *
 * The real page files stay under app/admin/* internally; middleware.ts
 * rewrites requests from this public slug to that internal path, and
 * blocks direct requests to the literal /admin path once a custom slug
 * is configured, so it can't be guessed.
 */
export const ADMIN_PATH = (process.env.ADMIN_PATH || 'admin').replace(/^\/|\/$/g, '')

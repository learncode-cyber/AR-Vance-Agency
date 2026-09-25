/**
 * The public URL path for the admin panel — e.g. "kali_master" means the
 * panel lives at /kali_master instead of /admin. Change it anytime by
 * updating NEXT_PUBLIC_ADMIN_PATH in your environment and restarting the
 * app — no code changes or rebuild-from-source needed (a redeploy/restart
 * that picks up the new env var is enough).
 *
 * The real page files stay under app/admin/* internally; middleware.ts
 * rewrites requests from this public slug to that internal path, and
 * blocks direct requests to the literal /admin path once a custom slug
 * is configured, so it can't be guessed.
 */
export const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin').replace(/^\/|\/$/g, '')

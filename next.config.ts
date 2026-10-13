import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs/config'

const ADMIN_PATH = (process.env.ADMIN_PATH || 'admin').replace(/^\/|\/$/g, '')

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'report-uri /api/csp-report',
].join('; ')

// Set CSP_ENFORCE=true at BUILD time to switch from Report-Only to enforcing once
// /api/csp-report logs show no legitimate violations (headers are baked in at build).
const CSP_HEADER = process.env.CSP_ENFORCE === 'true' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'

// Only proxy/optimise images from hosts we actually use (previously '**' =
// any host on the internet, which lets anyone burn your image-optimisation
// quota and bandwidth). R2_PUBLIC_URL is read at build time.
function r2Host(): string | null {
  try { return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null } catch { return null }
}
const imageHosts = [r2Host(), ...(process.env.IMAGE_ALLOWED_HOSTS || '').split(',').map((h) => h.trim())].filter(Boolean) as string[]

// Low-memory escape hatch ONLY: `npm run build:lowmem` skips the in-build type-check
// and lint (they need ~1.5GB extra RAM on top of compilation and got OOM-killed in a
// 4GB container). When used, run `npm run typecheck` and `npm run lint` separately —
// the default `npm run build` keeps both checks enforced.
const SKIP_BUILD_CHECKS = process.env.SKIP_BUILD_CHECKS === '1'

const config: NextConfig = {
  output: 'standalone',
  // Lowers peak RAM during `next build` (the build was being OOM-killed at ~4GB
  // in a 4GB container right after compilation). Matters on Hostinger too,
  // where build memory is limited.
  experimental: {
    webpackMemoryOptimizations: true,
  },
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: 'https' as const, hostname })),
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    // Type errors now FAIL the build (was `true`, which hid ~450 errors including
    // real crashes). Keep this false so regressions are caught before deploy.
    ignoreBuildErrors: SKIP_BUILD_CHECKS,
  },
  eslint: {
    ignoreDuringBuilds: SKIP_BUILD_CHECKS,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Report-Only on purpose: lets you see what would break (GA4, Meta
          // Pixel, Stripe, R2 images) in the browser console before enforcing.
          { key: CSP_HEADER, value: CSP },
        ],
      },
      {
        // Covers whichever slug ADMIN_PATH currently points to
        source: `/${ADMIN_PATH}/:path*`,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Source-map upload is skipped (not failed) when org/project/authToken
  // aren't set — error tracking itself doesn't need them, only prettier
  // stack traces on sentry.io do.
  silent: true,
  widenClientFileUpload: true,
})

// The current @sentry/nextjs SDK (confirmed from the installed package's own
// withSentryConfig internals, which read this exact filename) looks for
// client-side init here — sentry.client.config.ts is the older convention
// and is no longer picked up by this version.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  debug: false,
  // No-op (not an error) when NEXT_PUBLIC_SENTRY_DSN is unset — monitoring
  // is opt-in, the app must run fine without it.
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  ignoreErrors: ['top.GLOBALS', 'cancelled', 'Network request failed'],
})

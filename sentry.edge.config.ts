// Loaded from instrumentation.ts when NEXT_RUNTIME === 'edge' — this app's
// middleware.ts (admin-path rewriting) runs on the edge runtime, so errors
// there are only ever captured through this config, not the server one.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  debug: false,
  enabled: !!process.env.SENTRY_DSN,
})

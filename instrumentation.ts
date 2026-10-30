// Next.js's own instrumentation hook — automatically loaded at startup for
// every runtime. This is what actually activates Sentry; the sentry.*.config.ts
// files do nothing on their own without this.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Reports errors from Server Components, Route Handlers, and Server Actions
// that Next.js's own error boundary catches — this is what gives broad
// error coverage across the whole app's 240+ API routes without editing
// each one individually.
export async function onRequestError(...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>) {
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureRequestError(...args)
}

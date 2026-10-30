import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Tracking
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Debug
  debug: process.env.NODE_ENV === "development",
  
  // Ignore certain errors
  ignoreErrors: [
    "top.GLOBALS",
    "cancelled",
    "Network request failed",
  ],
});

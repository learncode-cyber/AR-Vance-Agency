import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
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
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Debug
  debug: process.env.NODE_ENV === "development",
  
  // Ignore certain errors
  ignoreErrors: [
    "NetworkError",
    "Network request failed",
    "CORS",
  ],
  
  // Before sending to Sentry
  beforeSend(event) {
    // Don't send if in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      return null;
    }
    
    // Mask sensitive data
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/[?&](password|token|secret)=[^&]*/g, "");
    }
    
    return event;
  },
});

import * as Sentry from "@sentry/nextjs";
import { prisma } from "./prisma";

// Track performance
export function trackPerformance(
  operationName: string,
  duration: number,
  metadata?: Record<string, any>
) {
  Sentry.captureMessage(
    `Performance: ${operationName} took ${duration}ms`,
    {
      level: duration > 1000 ? "warning" : "info",
      contexts: {
        performance: {
          duration,
          operationName,
          ...metadata,
        },
      },
    }
  );
}

// Track API calls
export function trackApiCall(
  method: string,
  path: string,
  statusCode: number,
  duration: number
) {
  const isError = statusCode >= 400;
  
  Sentry.captureMessage(
    `API ${method} ${path} - ${statusCode}`,
    {
      level: isError ? "error" : "info",
      contexts: {
        api: {
          method,
          path,
          statusCode,
          duration,
        },
      },
    }
  );
}

// Track database operations
export async function trackDatabaseOperation(
  operation: string,
  model: string,
  fn: () => Promise<any>,
  metadata?: Record<string, any>
) {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    trackPerformance(`DB ${model}.${operation}`, duration, metadata);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    Sentry.captureException(error, {
      contexts: {
        database: {
          operation,
          model,
          duration,
          ...metadata,
        },
      },
    });
    
    throw error;
  }
}

// Track user actions
export async function trackUserAction(
  userId: string,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: JSON.stringify(metadata || {}),
        timestamp: new Date(),
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });
    
    Sentry.captureMessage(`User action: ${action}`, {
      level: "info",
      contexts: {
        user: {
          userId,
          action,
          ...metadata,
        },
      },
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}

// Track errors
export function trackError(
  error: Error,
  context?: string,
  metadata?: Record<string, any>
) {
  Sentry.captureException(error, {
    tags: {
      context: context || "unknown",
    },
    contexts: {
      custom: metadata,
    },
  });
}

// Set user context
export function setUserContext(userId: string, userEmail: string, role: string) {
  Sentry.setUser({
    id: userId,
    email: userEmail,
    username: userEmail.split("@")[0],
    extra: { role },
  });
}

// Clear user context
export function clearUserContext() {
  Sentry.setUser(null);
}

// Add breadcrumb
export function addBreadcrumb(
  message: string,
  category: string = "user-action",
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: "info",
    data,
    timestamp: Date.now() / 1000,
  });
}

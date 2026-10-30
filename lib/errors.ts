// Central application error hierarchy.
// Every error carries an HTTP status, a stable machine-readable `code`, and a
// `publicMessage` that is safe to show to end users. Internal details (stack,
// DB messages, paths) stay in `cause`/logs and are never serialized.

export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly publicMessage: string
  readonly details?: unknown
  readonly cause?: unknown

  constructor(opts: { status: number; code: string; message: string; publicMessage?: string; details?: unknown; cause?: unknown }) {
    super(opts.message)
    this.name = new.target.name
    this.status = opts.status
    this.code = opts.code
    this.publicMessage = opts.publicMessage ?? opts.message
    this.details = opts.details
    this.cause = opts.cause
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request data', details?: unknown) {
    super({ status: 400, code: 'VALIDATION_ERROR', message, details })
  }
}
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super({ status: 401, code: 'AUTHENTICATION_ERROR', message })
  }
}
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super({ status: 403, code: 'AUTHORIZATION_ERROR', message })
  }
}
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super({ status: 404, code: 'NOT_FOUND', message: `${resource} not found` })
  }
}
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super({ status: 409, code: 'CONFLICT', message })
  }
}
export class RateLimitError extends AppError {
  readonly retryAfterSeconds?: number
  constructor(retryAfterSeconds?: number) {
    super({ status: 429, code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' })
    this.retryAfterSeconds = retryAfterSeconds
  }
}
export class DatabaseError extends AppError {
  constructor(cause?: unknown) {
    super({ status: 500, code: 'DATABASE_ERROR', message: 'Database operation failed', publicMessage: 'Something went wrong. Please try again.', cause })
  }
}
export class ExternalServiceError extends AppError {
  constructor(service: string, cause?: unknown) {
    super({ status: 502, code: 'EXTERNAL_SERVICE_ERROR', message: `${service} request failed`, publicMessage: 'An upstream service is unavailable. Please try again later.', cause })
  }
}
export class AIError extends AppError {
  constructor(message = 'AI request failed', cause?: unknown) {
    super({ status: 502, code: 'AI_ERROR', message, publicMessage: 'The AI service could not complete this request.', cause })
  }
}

/** Translate any thrown value into an AppError (Prisma/Zod aware). */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  const e = err as { name?: string; code?: string; issues?: { message: string; path: (string | number)[] }[]; errors?: unknown[] }
  if (e?.name === 'ZodError') {
    const first = (e.issues ?? [])[0]
    return new ValidationError(first?.message ?? 'Invalid request data', e.issues)
  }
  if (e?.code === 'P2002') return new ConflictError('A record with these values already exists')
  if (e?.code === 'P2025') return new NotFoundError()
  if (e?.code === 'P2003') return new ValidationError('Referenced record does not exist')
  if (typeof e?.code === 'string' && /^P\d{4}$/.test(e.code)) return new DatabaseError(err)
  return new AppError({
    status: 500,
    code: 'INTERNAL_ERROR',
    message: err instanceof Error ? err.message : 'Unknown error',
    publicMessage: 'Something went wrong. Please try again.',
    cause: err,
  })
}

import { toAppError, ValidationError, NotFoundError, ConflictError, DatabaseError, RateLimitError, AppError } from '@/lib/errors'

describe('toAppError', () => {
  it('passes AppError through unchanged', () => {
    const e = new NotFoundError('Lead')
    expect(toAppError(e)).toBe(e)
    expect(e.status).toBe(404)
  })
  it('maps Prisma unique violation to 409', () => {
    const e = toAppError({ code: 'P2002' })
    expect(e).toBeInstanceOf(ConflictError)
    expect(e.status).toBe(409)
  })
  it('maps Prisma not-found to 404', () => {
    expect(toAppError({ code: 'P2025' })).toBeInstanceOf(NotFoundError)
  })
  it('maps other Prisma codes to DatabaseError without leaking the message', () => {
    const e = toAppError({ code: 'P1001', message: 'Can\'t reach database at secret-host:3306' })
    expect(e).toBeInstanceOf(DatabaseError)
    expect(e.publicMessage).not.toMatch(/secret-host/)
  })
  it('maps ZodError to ValidationError', () => {
    const e = toAppError({ name: 'ZodError', issues: [{ message: 'Email invalid', path: ['email'] }] })
    expect(e).toBeInstanceOf(ValidationError)
    expect(e.publicMessage).toBe('Email invalid')
  })
  it('hides unknown error internals', () => {
    const e = toAppError(new Error('ENOENT /var/www/app/.env'))
    expect(e.status).toBe(500)
    expect(e.publicMessage).not.toMatch(/ENOENT|\.env/)
    expect(e).toBeInstanceOf(AppError)
  })
  it('RateLimitError carries retry-after', () => {
    expect(new RateLimitError(30).retryAfterSeconds).toBe(30)
  })
})

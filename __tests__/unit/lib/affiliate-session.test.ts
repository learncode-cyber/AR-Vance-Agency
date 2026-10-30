/** @jest-environment node */
process.env.JWT_SECRET = 'x'.repeat(40)
import { createAffiliateSession, readAffiliateSession, commissionFor } from '@/lib/affiliate-session'

describe('affiliate session cookie', () => {
  const now = 1_800_000_000_000
  it('accepts its own fresh cookie and returns the affiliate id', () => {
    const c = createAffiliateSession('aff_123', now)
    expect(readAffiliateSession(c, now + 1000)).toBe('aff_123')
  })
  it('rejects expired cookies', () => {
    const c = createAffiliateSession('aff_123', now)
    expect(readAffiliateSession(c, now + 31 * 24 * 3600 * 1000)).toBeNull()
  })
  it('rejects tampered ids and forged signatures', () => {
    const c = createAffiliateSession('aff_123', now)
    const [, exp, mac] = c.split('.')
    expect(readAffiliateSession(`aff_999.${exp}.${mac}`, now)).toBeNull()
    expect(readAffiliateSession(`aff_123.${exp}.AAAA`, now)).toBeNull()
    expect(readAffiliateSession('garbage', now)).toBeNull()
    expect(readAffiliateSession(undefined, now)).toBeNull()
  })
})

describe('commission', () => {
  it('is the rate of the subtotal after discount, rounded to cents', () => {
    expect(commissionFor(200, 0, 10)).toBe(20)
    expect(commissionFor(200, 50, 10)).toBe(15)
    expect(commissionFor(33.33, 0, 10)).toBe(3.33)
    expect(commissionFor(10, 999, 10)).toBe(0)
  })
})

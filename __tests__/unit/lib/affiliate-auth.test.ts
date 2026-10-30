import { hashToken, newVerifyToken, newReferralCode } from '@/lib/affiliate-auth'
describe('affiliate tokens', () => {
  it('verify tokens are long, unique and only the hash is comparable', () => {
    const a = newVerifyToken(), b = newVerifyToken()
    expect(a.length).toBeGreaterThanOrEqual(40); expect(a).not.toBe(b)
    expect(hashToken(a)).toMatch(/^[0-9a-f]{64}$/); expect(hashToken(a)).not.toContain(a)
  })
  it('referral codes are 8 uppercase characters', () => {
    for (let i = 0; i < 50; i++) expect(newReferralCode()).toMatch(/^[A-Z0-9]{8}$/)
  })
})

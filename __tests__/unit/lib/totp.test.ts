import { hotp, verifyTotp, base32Decode, base32Encode, generateSecret, otpauthUrl, currentStep } from '@/lib/totp'
import { encryptSecret, decryptSecret, generateBackupCodes, consumeBackupCode, checkTwoFactor } from '@/lib/two-factor'

// RFC 4226 Appendix D test vectors (secret "12345678901234567890")
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'))
const RFC_CODES = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489']

describe('HOTP/TOTP', () => {
  it.each(RFC_CODES.map((c, i) => [i, c]))('RFC4226 vector counter=%i', (i, code) => {
    expect(hotp(RFC_SECRET, i as number)).toBe(code)
  })
  it('RFC6238 vector: t=59s -> 94287082 (8 digits) ends with 287082 at 6 digits', () => {
    expect(hotp(RFC_SECRET, Math.floor(59 / 30))).toBe('287082')
  })
  it('base32 roundtrips', () => {
    const b = Buffer.from('hello world!')
    expect(base32Decode(base32Encode(b)).equals(b)).toBe(true)
  })
  it('accepts current code and ±1 step drift, rejects ±2', () => {
    const secret = generateSecret(); const now = 1_700_000_000_000; const s = currentStep(now)
    expect(verifyTotp(secret, hotp(secret, s), { now })).toBe(s)
    expect(verifyTotp(secret, hotp(secret, s - 1), { now })).toBe(s - 1)
    expect(verifyTotp(secret, hotp(secret, s + 2), { now })).toBeNull()
  })
  it('rejects replay of an already-used step', () => {
    const secret = generateSecret(); const now = 1_700_000_000_000; const s = currentStep(now)
    expect(verifyTotp(secret, hotp(secret, s), { now, lastUsedStep: s })).toBeNull()
  })
  it('rejects malformed codes', () => {
    const secret = generateSecret()
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 456']) expect(verifyTotp(secret, bad)).toBeNull()
  })
  it('builds a valid otpauth URL', () => {
    const u = otpauthUrl({ secret: 'ABC', account: 'a@b.com', issuer: 'AR Vance' })
    expect(u.startsWith('otpauth://totp/AR%20Vance%3Aa%40b.com?')).toBe(true)
    expect(u).toContain('secret=ABC')
  })
})

describe('2FA storage', () => {
  it('encrypts and decrypts secrets, and ciphertext differs each time', () => {
    const a = encryptSecret('JBSWY3DPEHPK3PXP'); const b = encryptSecret('JBSWY3DPEHPK3PXP')
    expect(a).not.toBe(b); expect(a).not.toContain('JBSWY3DPEHPK3PXP')
    expect(decryptSecret(a)).toBe('JBSWY3DPEHPK3PXP')
  })
  it('detects tampering', () => {
    const e = encryptSecret('secret'); const parts = e.split('.'); parts[3] = Buffer.from('x'.repeat(10)).toString('base64')
    expect(() => decryptSecret(parts.join('.'))).toThrow()
  })
  it('backup codes are single-use', () => {
    const { plain, hashes } = generateBackupCodes(3)
    const stored = JSON.stringify(hashes)
    const after = consumeBackupCode(stored, plain[0])!
    expect(after).toHaveLength(2)
    expect(consumeBackupCode(JSON.stringify(after), plain[0])).toBeNull()
    expect(consumeBackupCode(stored, 'aaaaa-bbbbb')).toBeNull()
  })
  it('checkTwoFactor accepts TOTP, backup code, and rejects garbage', () => {
    const secret = generateSecret(); const { plain, hashes } = generateBackupCodes(2)
    const user = { twoFactorSecret: encryptSecret(secret), twoFactorBackupCodes: JSON.stringify(hashes), twoFactorLastStep: null }
    const good = hotp(secret, currentStep())
    expect(checkTwoFactor(user, good).ok).toBe(true)
    expect(checkTwoFactor(user, plain[1]).ok).toBe(true)
    expect(checkTwoFactor(user, '000000').ok).toBe(false)
    expect(checkTwoFactor({ ...user, twoFactorSecret: null }, good).ok).toBe(false)
  })
})

import { generateApiKey, hashApiKey, keyRejection, isValidScope } from '@/lib/api-key'

describe('api keys', () => {
  it('generates a prefixed key whose stored hash is not the raw key', () => {
    const { raw, keyHash, keyPrefix } = generateApiKey()
    expect(raw.startsWith('arq_')).toBe(true)
    expect(keyHash).toBe(hashApiKey(raw))
    expect(keyHash).not.toContain(raw)
    expect(raw.startsWith(keyPrefix)).toBe(true)
    expect(keyHash).toMatch(/^[0-9a-f]{64}$/)
  })
  it('generates unique keys', () => {
    expect(generateApiKey().raw).not.toBe(generateApiKey().raw)
  })
  it('validates scopes', () => {
    expect(isValidScope('leads:read')).toBe(true)
    expect(isValidScope('admin:all')).toBe(false)
  })
  describe('keyRejection', () => {
    const now = new Date('2026-10-04T00:00:00Z')
    it('allows an active, unexpired key', () => {
      expect(keyRejection({ active: true, revokedAt: null, expiresAt: null }, now)).toBeNull()
      expect(keyRejection({ active: true, revokedAt: null, expiresAt: new Date('2026-12-01') }, now)).toBeNull()
    })
    it('rejects inactive or revoked keys', () => {
      expect(keyRejection({ active: false, revokedAt: null, expiresAt: null }, now)).toBe('revoked')
      expect(keyRejection({ active: true, revokedAt: new Date('2026-01-01'), expiresAt: null }, now)).toBe('revoked')
    })
    it('rejects expired keys (including exactly at expiry)', () => {
      expect(keyRejection({ active: true, revokedAt: null, expiresAt: new Date('2026-09-01') }, now)).toBe('expired')
      expect(keyRejection({ active: true, revokedAt: null, expiresAt: now }, now)).toBe('expired')
    })
  })
})

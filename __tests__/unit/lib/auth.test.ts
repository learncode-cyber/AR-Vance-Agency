/**
 * Previously this file never imported lib/auth.ts at all — every test
 * mocked `jsonwebtoken`/`bcryptjs` directly and asserted on the mock's call
 * arguments, which tests nothing about this app's actual code. One test
 * (`should include user ID in token`) was also internally inconsistent: it
 * called the mock with 2 arguments but asserted a 3rd was present, so it
 * could never pass regardless of what the real code does. Discovered by
 * actually running `npx jest` — something this whole suite had apparently
 * never had done to it.
 *
 * Rewritten to exercise the real exports from lib/auth.ts: signToken,
 * verifyToken, verifyPassword, COOKIE_NAME, COOKIE_OPTIONS.
 */
import { signToken, verifyToken, verifyPassword, COOKIE_NAME, COOKIE_OPTIONS, type AdminPayload } from '@/lib/auth'
import bcrypt from 'bcryptjs'

describe('lib/auth', () => {
  const payload: AdminPayload = { userId: 'user_123', email: 'admin@example.com', role: 'admin' }

  describe('signToken / verifyToken', () => {
    it('round-trips a payload through sign and verify', () => {
      const token = signToken(payload)
      expect(typeof token).toBe('string')

      const decoded = verifyToken(token)
      expect(decoded).toMatchObject(payload)
    })

    it('returns null for a malformed token instead of throwing', () => {
      expect(verifyToken('not-a-real-token')).toBeNull()
    })

    it('returns null for a token signed with a different secret', () => {
      // Sanity check that verifyToken actually validates the signature,
      // not just the shape of the string.
      const jwt = require('jsonwebtoken')
      const bogusToken = jwt.sign(payload, 'a-completely-different-secret-value')
      expect(verifyToken(bogusToken)).toBeNull()
    })

    it('rejects an expired token', () => {
      const jwt = require('jsonwebtoken')
      // Same fallback secret lib/auth.ts uses outside production (NODE_ENV
      // is 'test' here, so getSecret() falls back to this exact value).
      const DEV_FALLBACK_SECRET = 'dev-secret-change-this-in-production-min-32-chars'
      const expiredToken = jwt.sign(payload, DEV_FALLBACK_SECRET, { expiresIn: -1 })
      expect(verifyToken(expiredToken)).toBeNull()
    })
  })

  describe('verifyPassword', () => {
    it('resolves true for a matching password/hash pair', async () => {
      const hash = await bcrypt.hash('correct-horse-battery-staple', 10)
      await expect(verifyPassword('correct-horse-battery-staple', hash)).resolves.toBe(true)
    })

    it('resolves false for a non-matching password', async () => {
      const hash = await bcrypt.hash('correct-horse-battery-staple', 10)
      await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
    })
  })

  describe('cookie configuration', () => {
    it('exposes the expected cookie name', () => {
      expect(COOKIE_NAME).toBe('admin_token')
    })

    it('marks the cookie httpOnly with a 24h maxAge', () => {
      expect(COOKIE_OPTIONS.httpOnly).toBe(true)
      expect(COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24)
    })
  })
})

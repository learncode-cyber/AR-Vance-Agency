import crypto from 'crypto'
import { verifyStripeSignature } from '@/lib/stripe-webhook'

const secret = 'whsec_test_secret'
const body = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } } })
const now = 1_800_000_000_000
const sign = (b: string, t: number, s = secret) => crypto.createHmac('sha256', s).update(`${t}.${b}`).digest('hex')
const header = (t: number, sig: string) => `t=${t},v1=${sig}`
const ts = Math.floor(now / 1000)

describe('verifyStripeSignature', () => {
  it('accepts a correctly signed, fresh payload', () => {
    expect(verifyStripeSignature(body, header(ts, sign(body, ts)), secret, { now })).toEqual({ ok: true })
  })
  it('rejects a forged payload signed with the wrong secret', () => {
    expect(verifyStripeSignature(body, header(ts, sign(body, ts, 'attacker')), secret, { now })).toEqual({ ok: false, reason: 'bad_signature' })
  })
  it('rejects a tampered body', () => {
    const tampered = body.replace('pi_1', 'pi_2')
    expect(verifyStripeSignature(tampered, header(ts, sign(body, ts)), secret, { now }).ok).toBe(false)
  })
  it('rejects missing and malformed headers', () => {
    expect(verifyStripeSignature(body, null, secret, { now })).toEqual({ ok: false, reason: 'missing_header' })
    for (const h of ['', 'garbage', `t=${ts}`, `v1=abc`, `t=abc,v1=${sign(body, ts)}`]) expect(verifyStripeSignature(body, h, secret, { now }).ok).toBe(false)
  })
  it('rejects replays outside the 5-minute tolerance, accepts inside', () => {
    const old = ts - 301
    expect(verifyStripeSignature(body, header(old, sign(body, old)), secret, { now })).toEqual({ ok: false, reason: 'stale_timestamp' })
    const edge = ts - 299
    expect(verifyStripeSignature(body, header(edge, sign(body, edge)), secret, { now }).ok).toBe(true)
  })
  it('accepts when one of several v1 signatures matches (key rotation)', () => {
    const h = `t=${ts},v1=${'0'.repeat(64)},v1=${sign(body, ts)}`
    expect(verifyStripeSignature(body, h, secret, { now }).ok).toBe(true)
  })
  it('does not throw on non-hex or wrong-length signatures', () => {
    expect(verifyStripeSignature(body, `t=${ts},v1=zzzz`, secret, { now }).ok).toBe(false)
    expect(verifyStripeSignature(body, `t=${ts},v1=${'a'.repeat(63)}`, secret, { now }).ok).toBe(false)
  })
})

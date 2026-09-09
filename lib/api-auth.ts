import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from './auth'

/**
 * Use inside any /api/admin/* route handler.
 * Returns the verified JWT payload, or null (caller should then
 * return a 401 NextResponse).
 */
export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

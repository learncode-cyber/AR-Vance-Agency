import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, COOKIE_NAME } from './auth'
import { prisma } from './prisma'
import { ADMIN_PATH } from './admin-path'

/**
 * Call at the top of any protected admin server component/page.
 * Redirects to the current admin login URL if the session is missing or
 * invalid, otherwise returns the current admin user record.
 */
export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const loginUrl = `/${ADMIN_PATH}/login`

  if (!token) redirect(loginUrl)

  const payload = verifyToken(token)
  if (!payload) redirect(loginUrl)

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) redirect(loginUrl)

  return user
}

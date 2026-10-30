import { test, expect } from '@playwright/test'

/**
 * ADMIN_PATH must match whatever the server under test actually has
 * configured (defaults to 'kali_master' per .env.example/.env.development).
 * Selectors are read directly from app/admin/login/page.tsx — the email/
 * password inputs have no `name`/`id` attribute and their <label>s aren't
 * programmatically associated (no htmlFor/id), so getByLabel() would NOT
 * find them; placeholder/type-based locators are what actually work against
 * this real markup. NOT executed by the author — run before trusting.
 */
const ADMIN_PATH = process.env.ADMIN_PATH || 'kali_master'

test.describe('Admin authorization', () => {
  test('visiting an admin page while logged out redirects to login', async ({ page }) => {
    // Matches middleware.ts: no admin_token cookie -> redirect to
    // /{ADMIN_PATH}/login for any /{ADMIN_PATH}/* route other than login itself.
    await page.goto(`/${ADMIN_PATH}/dashboard`)
    await expect(page).toHaveURL(new RegExp(`/${ADMIN_PATH}/login`))
  })

  test('the real internal /admin path is unreachable once a custom slug is set', async ({ page }) => {
    test.skip(ADMIN_PATH === 'admin', 'No custom slug configured for this run — nothing to verify.')
    // Matches middleware.ts's literal-/admin block.
    const response = await page.goto('/admin')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Admin login form', () => {
  test('renders the expected fields', async ({ page }) => {
    await page.goto(`/${ADMIN_PATH}/login`)
    await expect(page.getByPlaceholder('admin@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('shows an error on invalid credentials', async ({ page }) => {
    await page.goto(`/${ADMIN_PATH}/login`)
    await page.getByPlaceholder('admin@example.com').fill('no-such-admin@example.com')
    await page.getByPlaceholder('••••••••').fill('definitely-wrong-password')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // app/api/auth/login/route.ts returns a generic "Invalid credentials."
    // message (deliberately not revealing whether the email exists).
    await expect(page.locator('.form-error-msg')).toBeVisible({ timeout: 10_000 })
  })

  test('logs in successfully with seeded admin credentials', async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL
    const password = process.env.E2E_ADMIN_PASSWORD
    test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to run this test.')

    await page.goto(`/${ADMIN_PATH}/login`)
    await page.getByPlaceholder('admin@example.com').fill(email!)
    await page.getByPlaceholder('••••••••').fill(password!)
    await page.getByRole('button', { name: 'Sign In' }).click()

    // On success, admin/login/page.tsx does router.push(adminRoot) where
    // adminRoot is derived from the current URL segment — i.e. back to
    // /{ADMIN_PATH} (the dashboard), not /login.
    await expect(page).toHaveURL(new RegExp(`/${ADMIN_PATH}/?$`), { timeout: 10_000 })
  })
})

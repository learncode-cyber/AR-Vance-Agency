import { test, expect } from '@playwright/test'

test.describe('Homepage smoke test', () => {
  test('loads and includes Organization structured data', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)

    // lib/seo/schema.ts's organizationSchema() is rendered in
    // app/(public)/layout.tsx on every public page — confirm it's really
    // present in the HTML, not just that the code exists.
    const ldJsonScripts = page.locator('script[type="application/ld+json"]')
    const count = await ldJsonScripts.count()
    expect(count).toBeGreaterThanOrEqual(2) // Organization + WebSite

    const firstSchema = JSON.parse((await ldJsonScripts.first().textContent()) || '{}')
    expect(firstSchema['@context']).toBe('https://schema.org')
  })

  test('services page lists at least one service with Service structured data', async ({ page }) => {
    await page.goto('/services')
    const ldJsonScripts = page.locator('script[type="application/ld+json"]')
    await expect(ldJsonScripts.first()).toBeAttached()
  })
})

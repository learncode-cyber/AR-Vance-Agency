import { test, expect } from '@playwright/test'

/**
 * Selectors/text here are read directly from components/ui/ContactForm.tsx —
 * not invented. If that component's placeholders/copy change, update here
 * too. NOT executed by the author (no browser/live DB in that sandbox) —
 * run locally/in CI before trusting.
 */
test.describe('Contact form (lead capture)', () => {
  test('submits successfully with valid data', async ({ page }) => {
    await page.goto('/contact')

    await page.getByPlaceholder('John Smith').fill('Test User')
    await page.getByPlaceholder('john@company.com').fill(`e2e-${Date.now()}@example.com`)
    await page.getByPlaceholder('How can we help?').fill('E2E test subject')
    await page
      .getByPlaceholder('Tell us about your project, goals, and timeline…')
      .fill('This is an automated end-to-end test submission, at least 20 characters long.')

    await page.getByRole('button', { name: 'Send Message →' }).click()

    // Real success-state copy from ContactForm.tsx's `status === 'success'` branch.
    await expect(page.getByText(/Message sent!/i)).toBeVisible({ timeout: 10_000 })
  })

  test('rejects a message shorter than the 20-character minimum', async ({ page }) => {
    await page.goto('/contact')

    await page.getByPlaceholder('John Smith').fill('Test User')
    await page.getByPlaceholder('john@company.com').fill('e2e@example.com')
    await page.getByPlaceholder('How can we help?').fill('Subject')
    await page.getByPlaceholder('Tell us about your project, goals, and timeline…').fill('Too short')

    // The <textarea> has a real minLength={20} + required attribute, so the
    // browser's own validation should block submission before any request
    // is sent — the success message must never appear.
    await page.getByRole('button', { name: 'Send Message →' }).click()
    await expect(page.getByText(/Message sent!/i)).not.toBeVisible()
  })
})

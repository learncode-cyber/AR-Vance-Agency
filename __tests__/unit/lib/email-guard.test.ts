/** @jest-environment node */
const sendMail = jest.fn().mockResolvedValue({ messageId: 'm1' })
jest.mock('nodemailer', () => ({ __esModule: true, default: { createTransport: () => ({ sendMail: (...a: unknown[]) => sendMail(...a) }) } }))
jest.mock('@/lib/prisma', () => ({ prisma: { emailLog: { create: jest.fn() } } }))
import { sendEmail } from '@/lib/email'

describe('sendEmail header-injection guard', () => {
  beforeEach(() => { sendMail.mockClear(); jest.spyOn(console, 'error').mockImplementation(() => {}) })
  it('sends a normal message', async () => {
    const r = await sendEmail({ to: 'a@example.com', subject: 'Hello', html: '<p>x</p>' })
    expect(sendMail).toHaveBeenCalledTimes(1); expect(r).toMatchObject({ success: true })
  })
  it('refuses a recipient containing a line break (smuggled Bcc)', async () => {
    const r = await sendEmail({ to: 'a@example.com\r\nBcc: evil@example.com', subject: 'Hi', html: 'x' })
    expect(sendMail).not.toHaveBeenCalled(); expect(r).toMatchObject({ success: false })
  })
  it('refuses a subject containing a line break', async () => {
    await sendEmail({ to: 'a@example.com', subject: 'Hi\nBcc: evil@example.com', html: 'x' })
    expect(sendMail).not.toHaveBeenCalled()
  })
})

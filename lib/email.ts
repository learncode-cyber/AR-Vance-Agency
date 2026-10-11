import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  templateId?: string
}

interface ContactEmailInput {
  name: string
  email: string
  subject: string
  service: string
  message: string
}

/**
 * Notify the agency of a new contact-form lead, and send the visitor a
 * short auto-reply. This was imported by app/api/contact/route.ts but
 * never existed here — every real visitor submission hit this call,
 * threw, and the route returned a 500 "Failed to send message" even
 * though the lead had already been saved to the CRM.
 *
 * Deliberately does not throw: a site owner who hasn't configured SMTP
 * yet, or a transient SMTP hiccup, should not stop the lead from being
 * recorded and the visitor from seeing a success message. The lead is
 * always in the CRM (saved before this runs) regardless of email outcome.
 */
export async function sendContactEmail(input: ContactEmailInput) {
  const { getSettings } = await import('./settings')
  const settings = await getSettings()
  const to = settings.contactEmail || process.env.SMTP_FROM || process.env.SMTP_USER

  if (!to) {
    console.warn('[email] sendContactEmail: no destination address configured, skipping.')
    return { success: false, error: 'No contact destination configured' }
  }

  const notifyResult = await sendEmail({
    to,
    subject: `New contact form: ${input.subject}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Service:</strong> ${escapeHtml(input.service || '—')}</p>
      <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(input.message).replace(/\n/g, '<br/>')}</p>
    `,
  })

  // Best-effort auto-reply — failure here should never fail the form.
  await sendEmail({
    to: input.email,
    subject: `We received your message — ${settings.siteName || 'AR Vance Agency'}`,
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Thanks for reaching out — we've received your message and will get back to you shortly.</p>
      <p>— ${settings.siteName || 'AR Vance Agency'}</p>
    `,
  }).catch((err) => console.error('[email] Contact auto-reply failed:', err))

  return notifyResult
}

interface ConsultationConfirmationInput {
  clientName: string
  clientEmail: string
  title: string
  date: Date
  startTime: string
  endTime: string
  timezone: string
  meetingType: string
  meetingLink: string
}

/**
 * Was a `// TODO: Send confirmation email here` in
 * app/api/booking/create/route.ts that was never implemented — a client
 * could book a consultation and get a 200 response with no email ever
 * sent confirming the date/time/meeting link. Non-throwing, same as
 * sendContactEmail: a booking that's already saved to the DB should never
 * be undone by an email hiccup.
 */
export async function sendConsultationConfirmationEmail(input: ConsultationConfirmationInput) {
  const { getSettings } = await import('./settings')
  const settings = await getSettings()
  const formattedDate = input.date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return sendEmail({
    to: input.clientEmail,
    subject: `Confirmed: ${input.title} — ${formattedDate}`,
    html: `
      <h2>Your consultation is confirmed</h2>
      <p>Hi ${escapeHtml(input.clientName)},</p>
      <p>Here are your booking details:</p>
      <ul>
        <li><strong>What:</strong> ${escapeHtml(input.title)}</li>
        <li><strong>When:</strong> ${formattedDate}, ${escapeHtml(input.startTime)}–${escapeHtml(input.endTime)} (${escapeHtml(input.timezone)})</li>
        <li><strong>Where:</strong> ${escapeHtml(input.meetingType)}${/^https?:\/\//.test(input.meetingLink) ? ` — <a href="${escapeHtml(input.meetingLink)}">${escapeHtml(input.meetingLink)}</a>` : ' — we will send you the meeting details before the call'}</li>
      </ul>
      <p>— ${settings.siteName || 'AR Vance Agency'}</p>
    `,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Send email and log it to database
 */
export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, templateId } = options

  try {
    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to,
      subject,
      html,
      text: text || '',
    })

    // Log email
    if (templateId) {
      await prisma.emailLog.create({
        data: {
          templateId,
          recipientEmail: to,
          recipientName: to.split('@')[0],
          subject,
          htmlContent: html,
          status: 'sent',
          sentAt: new Date(),
        },
      })
    }

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)

    if (templateId) {
      await prisma.emailLog.create({
        data: {
          templateId,
          recipientEmail: to,
          recipientName: to.split('@')[0],
          subject,
          htmlContent: html,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send email using template
 */
export async function sendEmailTemplate(
  templateSlug: string,
  recipientEmail: string,
  variables: Record<string, string>
) {
  try {
    const template = await prisma.emailTemplate.findUniqueOrThrow({
      where: { slug: templateSlug },
    })

    if (!template.active) {
      throw new Error('Template is inactive')
    }

    // Replace variables in content
    let htmlContent = template.htmlContent
    let subject = template.subject

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value)
      subject = subject.replace(new RegExp(placeholder, 'g'), value)
    }

    return sendEmail({
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: template.textContent,
      templateId: template.id,
    })
  } catch (error) {
    console.error('Template email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  orderNumber: string
) {
  return sendEmailTemplate('order-confirmation', customerEmail, {
    customerName,
    orderNumber,
    orderId,
  })
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
  orderNumber: string,
  customerEmail: string,
  trackingNumber: string,
  carrier: string
) {
  return sendEmailTemplate('order-shipped', customerEmail, {
    orderNumber,
    trackingNumber,
    carrier,
  })
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(
  orderNumber: string,
  customerEmail: string
) {
  return sendEmailTemplate('order-delivered', customerEmail, {
    orderNumber,
  })
}

/**
 * Send refund email
 */
export async function sendRefundEmail(
  orderNumber: string,
  customerEmail: string,
  refundAmount: number
) {
  return sendEmailTemplate('refund-processed', customerEmail, {
    orderNumber,
    refundAmount: refundAmount.toString(),
  })
}

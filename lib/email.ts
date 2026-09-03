import nodemailer from 'nodemailer'
import prisma from './prisma'

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

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ExportTable } from '@/lib/export/types'

export const REPORT_TYPES = ['project-profitability', 'client-revenue', 'monthly-summary', 'lead-pipeline', 'orders', 'consultations'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

const day = /^\d{4}-\d{2}-\d{2}$/
export const reportRequestSchema = z.object({
  type: z.enum(REPORT_TYPES),
  dateFrom: z.string().regex(day, 'dateFrom must be YYYY-MM-DD'),
  dateTo: z.string().regex(day, 'dateTo must be YYYY-MM-DD'),
}).refine((v) => new Date(v.dateFrom) <= new Date(v.dateTo), { message: 'dateFrom must not be after dateTo', path: ['dateFrom'] })
  .refine((v) => (new Date(v.dateTo).getTime() - new Date(v.dateFrom).getTime()) / 86_400_000 <= 366 * 3, { message: 'Date range is limited to 3 years', path: ['dateTo'] })

export type ReportRequest = z.infer<typeof reportRequestSchema>

const CAP = 5000

/** Inclusive UTC day range (the old code used server-local setHours, so the end date shifted with the host timezone). */
export function dateRange(from: string, to: string) {
  return { start: new Date(`${from}T00:00:00.000Z`), end: new Date(`${to}T23:59:59.999Z`) }
}

export async function buildReport(req: ReportRequest): Promise<ExportTable> {
  const { start, end } = dateRange(req.dateFrom, req.dateTo)
  const range = { gte: start, lte: end }
  const subtitle = `${req.dateFrom} to ${req.dateTo}`

  switch (req.type) {
    case 'project-profitability': {
      const projects = await prisma.project.findMany({ where: { createdAt: range }, include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: CAP })
      return {
        title: 'Project Profitability Report', subtitle,
        columns: [
          { key: 'name', label: 'Project' }, { key: 'client', label: 'Client' },
          { key: 'budget', label: 'Budget', type: 'currency' }, { key: 'roi', label: 'ROI %', type: 'number' },
          { key: 'completionRate', label: 'Completion %', type: 'number' }, { key: 'profit', label: 'Est. profit', type: 'currency' },
        ],
        rows: projects.map((p) => ({ name: p.name, client: p.client?.name ?? '', budget: p.budget, roi: p.roi, completionRate: p.completionRate, profit: p.budget * (p.roi / 100) })),
      }
    }
    case 'client-revenue': {
      const clients = await prisma.client.findMany({ where: { createdAt: range }, include: { projects: { where: { createdAt: range }, select: { budget: true } } }, orderBy: { createdAt: 'desc' }, take: CAP })
      return {
        title: 'Client Revenue Analysis', subtitle,
        columns: [
          { key: 'name', label: 'Client' }, { key: 'company', label: 'Company' }, { key: 'projectCount', label: 'Projects', type: 'number' },
          { key: 'totalSpent', label: 'Total budget', type: 'currency' }, { key: 'avg', label: 'Avg project', type: 'currency' },
        ],
        rows: clients.map((c) => {
          const total = c.projects.reduce((s, p) => s + p.budget, 0)
          return { name: c.name, company: c.company, projectCount: c.projects.length, totalSpent: total, avg: c.projects.length ? total / c.projects.length : 0 }
        }),
      }
    }
    case 'lead-pipeline': {
      const rows = await prisma.lead.findMany({ where: { createdAt: range }, select: { name: true, company: true, email: true, phone: true, service: true, stage: true, source: true, valueEstimate: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: CAP })
      return {
        title: 'Lead Pipeline', subtitle,
        columns: [
          { key: 'name', label: 'Name' }, { key: 'company', label: 'Company' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
          { key: 'service', label: 'Service' }, { key: 'stage', label: 'Stage' }, { key: 'source', label: 'Source' },
          { key: 'valueEstimate', label: 'Value', type: 'currency' }, { key: 'createdAt', label: 'Created', type: 'datetime' },
        ],
        rows,
      }
    }
    case 'orders': {
      const rows = await prisma.order.findMany({ where: { createdAt: range }, select: { orderNumber: true, customerName: true, customerEmail: true, status: true, paymentStatus: true, paymentMethod: true, subtotal: true, tax: true, shipping: true, discount: true, total: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: CAP })
      return {
        title: 'Orders', subtitle,
        columns: [
          { key: 'orderNumber', label: 'Order #' }, { key: 'customerName', label: 'Customer' }, { key: 'customerEmail', label: 'Email' },
          { key: 'status', label: 'Status' }, { key: 'paymentStatus', label: 'Payment' }, { key: 'paymentMethod', label: 'Method' },
          { key: 'subtotal', label: 'Subtotal', type: 'currency' }, { key: 'tax', label: 'Tax', type: 'currency' }, { key: 'shipping', label: 'Shipping', type: 'currency' },
          { key: 'discount', label: 'Discount', type: 'currency' }, { key: 'total', label: 'Total', type: 'currency' }, { key: 'createdAt', label: 'Placed', type: 'datetime' },
        ],
        rows,
      }
    }
    case 'consultations': {
      const rows = await prisma.consultation.findMany({ where: { date: range }, select: { clientName: true, clientEmail: true, clientPhone: true, title: true, date: true, startTime: true, endTime: true, status: true, meetingType: true }, orderBy: { date: 'asc' }, take: CAP })
      return {
        title: 'Consultations', subtitle,
        columns: [
          { key: 'date', label: 'Date', type: 'date' }, { key: 'startTime', label: 'Start' }, { key: 'endTime', label: 'End' },
          { key: 'clientName', label: 'Client' }, { key: 'clientEmail', label: 'Email' }, { key: 'clientPhone', label: 'Phone' },
          { key: 'title', label: 'Service' }, { key: 'status', label: 'Status' }, { key: 'meetingType', label: 'Type' },
        ],
        rows,
      }
    }
    case 'monthly-summary': {
      const [leads, wonLeads, clients, orders, paidOrders, consultations] = await Promise.all([
        prisma.lead.count({ where: { createdAt: range } }),
        prisma.lead.count({ where: { createdAt: range, stage: 'won' } }),
        prisma.client.count({ where: { createdAt: range } }),
        prisma.order.count({ where: { createdAt: range } }),
        prisma.order.aggregate({ where: { createdAt: range, paymentStatus: { in: ['completed', 'succeeded'] } }, _sum: { total: true }, _count: { _all: true } }),
        prisma.consultation.count({ where: { date: range, status: { not: 'cancelled' } } }),
      ])
      return {
        title: 'Summary Report', subtitle,
        columns: [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value', type: 'number' }],
        rows: [
          { metric: 'New leads', value: leads }, { metric: 'Leads won', value: wonLeads },
          { metric: 'Lead win rate %', value: leads ? Math.round((wonLeads / leads) * 1000) / 10 : 0 },
          { metric: 'New clients', value: clients }, { metric: 'Orders placed', value: orders },
          { metric: 'Paid orders', value: paidOrders._count._all }, { metric: 'Paid revenue', value: paidOrders._sum.total ?? 0 },
          { metric: 'Consultations booked', value: consultations },
        ],
      }
    }
  }
}

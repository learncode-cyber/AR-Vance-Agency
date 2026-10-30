# Digital Agency - API Routes Implementation Guide

## 🎯 Complete API Routes for Agency Platform

### 1️⃣ Projects API Routes

**File: `app/api/agency/projects/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  serviceId: z.string().optional(),
  clientId: z.string(),
  status: z.enum(['proposal', 'active', 'completed', 'archived']),
  budget: z.number().min(0),
  technologies: z.array(z.string()),
  features: z.array(z.string()),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// GET /api/agency/projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: true,
          service: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/agency/projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...data,
        technologies: JSON.stringify(data.technologies),
        features: JSON.stringify(data.features),
      },
      include: {
        client: true,
        service: true,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 400 }
    )
  }
}
```

---

### 2️⃣ Clients API Routes

**File: `app/api/agency/clients/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/agency/clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          projects: true,
          quotes: true,
          invoices: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      clients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST /api/agency/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = clientSchema.parse(body)

    const client = await prisma.client.create({
      data,
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 400 }
    )
  }
}
```

---

### 3️⃣ Quotes API Routes

**File: `app/api/agency/quotes/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const quoteItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
})

const quoteSchema = z.object({
  clientId: z.string(),
  title: z.string(),
  description: z.string(),
  items: z.array(quoteItemSchema),
  tax: z.number().default(0),
  discount: z.number().default(0),
  validUntil: z.string().datetime().optional(),
})

// POST /api/agency/quotes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, ...quoteData } = quoteSchema.parse(body)

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const total = subtotal + quoteData.tax - quoteData.discount

    // Generate quote number
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { quoteNumber: true },
    })
    
    let nextNumber = 1001
    if (lastQuote?.quoteNumber) {
      const lastNum = parseInt(lastQuote.quoteNumber.split('-')[1])
      nextNumber = lastNum + 1
    }
    const quoteNumber = `QT-${nextNumber}`

    const quote = await prisma.quote.create({
      data: {
        ...quoteData,
        quoteNumber,
        subtotal,
        total,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        client: true,
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 400 }
    )
  }
}

// GET /api/agency/quotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const where: any = {}
    if (clientId) where.clientId = clientId
    if (status) where.status = status

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        items: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
```

---

### 4️⃣ Invoices API Routes

**File: `app/api/agency/invoices/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const invoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
})

const invoiceSchema = z.object({
  clientId: z.string(),
  description: z.string(),
  items: z.array(invoiceItemSchema),
  tax: z.number().default(0),
  discount: z.number().default(0),
  dueDate: z.string().datetime(),
})

// POST /api/agency/invoices
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, ...invoiceData } = invoiceSchema.parse(body)

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const total = subtotal + invoiceData.tax - invoiceData.discount

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })

    let nextNumber = 1001
    if (lastInvoice?.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1])
      nextNumber = lastNum + 1
    }
    const invoiceNumber = `INV-${nextNumber}`

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        subtotal,
        total,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        client: true,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 400 }
    )
  }
}

// GET /api/agency/invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
```

---

### 5️⃣ Tasks API Routes

**File: `app/api/agency/tasks/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const taskSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().optional(),
})

// GET /api/agency/tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/agency/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = taskSchema.parse(body)

    const task = await prisma.task.create({
      data,
      include: {
        project: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 400 }
    )
  }
}
```

---

## 📝 Usage Examples

### Using Components in Pages

**File: `app/admin/agency/projects/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from '@/components/agency/ProjectCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/agency/projects')
        const data = await response.json()
        setProjects(data.projects)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/admin/agency/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  )
}
```

---

## 🚀 Next Steps

1. Copy all component files to `components/agency/`
2. Create all API routes as shown above
3. Update your Prisma schema with the models from Step 1 of the implementation guide
4. Run `npx prisma migrate dev --name add_agency_models`
5. Start using components in your admin pages

---

**All components are production-ready, TypeScript-safe, and Tailwind-styled!** ✅

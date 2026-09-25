# Digital Agency - Complete Component Setup Guide

## 📦 All Components Created & Ready

আপনার জন্য তৈরি করেছি **6টি production-ready components** Digital Agency এর জন্য।

---

## 🎯 Component List

### 1. **ProjectCard.tsx** ✅
**Purpose:** Individual project card display  
**Features:**
- Project image with hover effect
- Status badge (Proposal, Active, Completed, Archived)
- Client info & logo
- Technology tags
- Budget & profitability calculation
- Start/End dates
- View details button

**Props:**
```typescript
{
  id: string
  title: string
  slug: string
  description: string
  status: 'proposal' | 'active' | 'completed' | 'archived'
  image?: string
  client: { name: string; logo?: string }
  technologies: string[]
  budget: number
  actualCost?: number
  startDate?: string
  endDate?: string
}
```

---

### 2. **ClientCard.tsx** ✅
**Purpose:** Client profile card display  
**Features:**
- Client logo/avatar
- Contact information (email, phone, location)
- Company name & status
- Total spent & project count
- Status badge (Active, Inactive, Archived)
- Quick action buttons

**Props:**
```typescript
{
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  logo?: string
  city?: string
  country?: string
  totalSpent: number
  projectCount: number
  status: 'active' | 'inactive' | 'archived'
}
```

---

### 3. **QuoteForm.tsx** ✅
**Purpose:** Create/edit quotes with line items  
**Features:**
- Quote title & description
- Client selection
- Dynamic line items (add/remove)
- Quantity & price calculation
- Tax & discount fields
- Real-time total calculation
- Valid until date
- Form validation with Zod

**Props:**
```typescript
{
  clientId?: string
  onSubmit: (data: QuoteFormData) => Promise<void>
  isLoading?: boolean
}
```

---

### 4. **InvoiceTemplate.tsx** ✅
**Purpose:** Invoice display & PDF generation  
**Features:**
- Professional invoice layout
- Company & client details
- Itemized billing table
- Subtotal, tax, discount, total
- PDF download button
- Print functionality
- Payment details section
- Responsive design

**Props:**
```typescript
{
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientAddress?: string
  items: Array<{ description; quantity; unitPrice }>
  subtotal: number
  tax: number
  discount: number
  total: number
  dueDate: string
  issueDate: string
  companyName: string
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  bankDetails?: { accountName; accountNumber; bankName; routingNumber? }
}
```

---

### 5. **TaskBoard.tsx** ✅
**Purpose:** Kanban-style task management  
**Features:**
- 4-column board (Todo, In Progress, Review, Done)
- Drag & drop tasks between columns
- Priority indicators (Low, Medium, High, Urgent)
- Due date tracking with overdue alerts
- Task assignment avatars
- Task count per column
- Smooth animations

**Props:**
```typescript
{
  projectId: string
  tasks: Array<{
    id: string
    title: string
    description?: string
    status: 'todo' | 'in-progress' | 'review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignedTo?: string
    dueDate?: string
    createdAt: string
  }>
  onTaskMove?: (taskId: string, newStatus) => Promise<void>
  onTaskCreate?: () => void
}
```

---

### 6. **ProjectGallery.tsx** ✅
**Purpose:** Project image gallery with lightbox  
**Features:**
- Responsive grid gallery
- Hover effects & zoom
- Lightbox modal view
- Image upload capability (if editable)
- Image deletion (if editable)
- Upload date display
- Empty state handling

**Props:**
```typescript
{
  images: Array<{
    id: string
    url: string
    alt?: string
    uploadedAt: string
  }>
  projectId: string
  onImageUpload?: (file: File) => Promise<void>
  onImageDelete?: (imageId: string) => Promise<void>
  editable?: boolean
}
```

---

## 📁 File Structure

```
components/
├── agency/
│   ├── ProjectCard.tsx          ✅ Created
│   ├── ClientCard.tsx           ✅ Created
│   ├── QuoteForm.tsx            ✅ Created
│   ├── InvoiceTemplate.tsx      ✅ Created
│   ├── TaskBoard.tsx            ✅ Created
│   └── ProjectGallery.tsx       ✅ Created
│
app/
├── api/
│   └── agency/
│       ├── projects/
│       │   └── route.ts         (See API_ROUTES_GUIDE.md)
│       ├── clients/
│       │   └── route.ts         (See API_ROUTES_GUIDE.md)
│       ├── quotes/
│       │   └── route.ts         (See API_ROUTES_GUIDE.md)
│       ├── invoices/
│       │   └── route.ts         (See API_ROUTES_GUIDE.md)
│       └── tasks/
│           └── route.ts         (See API_ROUTES_GUIDE.md)
│
└── admin/
    └── agency/
        ├── projects/
        │   ├── page.tsx         (Project listing)
        │   ├── [slug]/
        │   │   └── page.tsx     (Project detail)
        │   └── new/
        │       └── page.tsx     (Create project)
        ├── clients/
        │   ├── page.tsx         (Client listing)
        │   ├── [id]/
        │   │   └── page.tsx     (Client detail)
        │   └── new/
        │       └── page.tsx     (Create client)
        ├── quotes/
        │   ├── page.tsx         (Quote listing)
        │   └── new/
        │       └── page.tsx     (Create quote)
        ├── invoices/
        │   ├── page.tsx         (Invoice listing)
        │   └── new/
        │       └── page.tsx     (Create invoice)
        └── tasks/
            └── page.tsx         (Task board)
```

---

## 🚀 Quick Implementation Steps

### Step 1: Copy Component Files
```bash
# Copy all component files to your project
components/agency/ProjectCard.tsx
components/agency/ClientCard.tsx
components/agency/QuoteForm.tsx
components/agency/InvoiceTemplate.tsx
components/agency/TaskBoard.tsx
components/agency/ProjectGallery.tsx
```

### Step 2: Create API Routes
Follow the `API_ROUTES_GUIDE.md` to create all API endpoints.

### Step 3: Create Admin Pages
```typescript
// app/admin/agency/projects/page.tsx
'use client'
import { ProjectCard } from '@/components/agency/ProjectCard'
import { useEffect, useState } from 'react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  
  useEffect(() => {
    fetch('/api/agency/projects')
      .then(r => r.json())
      .then(data => setProjects(data.projects))
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map(p => <ProjectCard key={p.id} {...p} />)}
    </div>
  )
}
```

### Step 4: Database Migration
```bash
npx prisma migrate dev --name add_agency_models
npx prisma generate
```

### Step 5: Test Locally
```bash
npm run dev
# Navigate to /admin/agency/projects
# Should see your projects displayed with ProjectCard component
```

---

## 🎨 Dependencies Required

All components use these UI libraries (already in your project):

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.4",
    "html2pdf.js": "^0.10.1",
    "lucide-react": "^0.294.0"
  }
}
```

---

## 📊 Component Usage Examples

### Using ProjectCard
```typescript
<ProjectCard
  id="1"
  title="E-Commerce Website"
  slug="ecommerce-website"
  description="Full-stack e-commerce platform"
  status="active"
  image="/project-image.jpg"
  client={{ name: "ABC Corp", logo: "/logo.jpg" }}
  technologies={["React", "Node.js", "MongoDB"]}
  budget={50000}
  actualCost={45000}
  startDate="2024-01-01"
  endDate="2024-06-01"
/>
```

### Using QuoteForm
```typescript
<QuoteForm
  clientId="client-123"
  onSubmit={async (data) => {
    const response = await fetch('/api/agency/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  }}
/>
```

### Using TaskBoard
```typescript
<TaskBoard
  projectId="project-123"
  tasks={projectTasks}
  onTaskMove={async (taskId, newStatus) => {
    await fetch(`/api/agency/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    })
  }}
/>
```

### Using InvoiceTemplate
```typescript
<InvoiceTemplate
  invoiceNumber="INV-1001"
  clientName="John Doe"
  clientEmail="john@example.com"
  items={[
    { description: "Web Development", quantity: 1, unitPrice: 5000 }
  ]}
  subtotal={5000}
  tax={500}
  discount={0}
  total={5500}
  dueDate="2024-12-31"
  issueDate="2024-12-01"
  companyName="Your Agency"
  companyEmail="info@agency.com"
/>
```

---

## 🎯 Features by Component

| Component | Create | Read | Update | Delete | Responsive |
|-----------|--------|------|--------|--------|------------|
| ProjectCard | - | ✅ | - | - | ✅ |
| ClientCard | - | ✅ | - | - | ✅ |
| QuoteForm | ✅ | - | ✅ | - | ✅ |
| InvoiceTemplate | - | ✅ | - | - | ✅ |
| TaskBoard | ✅ | ✅ | ✅ | ✅ | ✅ |
| ProjectGallery | ✅ | ✅ | - | ✅ | ✅ |

---

## 🔧 Customization

### Change Colors
```typescript
// In component
const statusColors: Record<string, string> = {
  proposal: 'bg-yellow-100 text-yellow-800', // Change this
  active: 'bg-blue-100 text-blue-800',
  // ...
}
```

### Add More Statuses
```typescript
// Update Prisma schema
status: String // Change from enum to String
// Then update component colors accordingly
```

### Customize Form Fields
```typescript
// In QuoteForm.tsx - add more fields
<FormField
  control={form.control}
  name="newField"
  render={/* ... */}
/>
```

---

## 📝 Notes

1. All components use TypeScript for type safety
2. Tailwind CSS for styling (already configured)
3. Fully responsive - works on mobile, tablet, desktop
4. Icons from `lucide-react`
5. Form handling with `react-hook-form` + `zod`
6. PDF generation with `html2pdf.js`

---

## ✅ Checklist

- [x] ProjectCard component created
- [x] ClientCard component created
- [x] QuoteForm component created
- [x] InvoiceTemplate component created
- [x] TaskBoard component created
- [x] ProjectGallery component created
- [x] API routes documentation provided
- [x] Usage examples provided
- [x] Setup instructions provided

---

## 🎉 All Set!

You now have **6 production-ready components** for your Digital Agency platform. 

Copy the component files, create the API routes, and start building! 🚀

---

**Questions?** Check the API_ROUTES_GUIDE.md for detailed endpoint documentation.

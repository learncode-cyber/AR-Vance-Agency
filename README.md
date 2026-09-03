# AR Vance Agency — Website + Admin Panel

A full-stack digital agency website built with Next.js 15, MySQL, and
Prisma. Every piece of content — services, blog posts, portfolio case
studies, team members, testimonials, and site-wide settings — is editable
from a built-in admin panel with no code changes required.

## Stack

- **Next.js 15** (App Router) — hybrid SSR/SSG/ISR for SEO
- **MySQL + Prisma** — data layer (Hostinger-compatible; list fields like
  tags/features are stored as JSON columns since MySQL has no native array type)
- **JWT auth** (httpOnly cookies) — admin panel login
- **Nodemailer** — contact form email delivery
- **Zod** — API input validation
- **Cloudflare R2** — image upload storage (falls back to local disk if unconfigured)
- **Docker + Nginx** — production deployment

## Project Structure

```
app/
  (public)/          → Marketing site (Home, Services, Portfolio, About, Blog, Contact)
  admin/
    login/            → Admin login (unprotected)
    (dashboard)/       → Protected admin panel (Dashboard, Services, Blog,
                          Portfolio, Team, Leads, Settings)
  api/
    contact/           → Public contact form endpoint (creates a Lead + sends email)
    auth/               → Login / logout
    admin/              → Protected CRUD endpoints, one folder per content type
  sitemap.ts / robots.ts / llms.txt/ → SEO infrastructure
components/
  layout/              → Navbar, Footer
  ui/                  → ScrollReveal, ContactForm, PortfolioFilter
  admin/                → AdminSidebar, Modal
lib/
  prisma.ts             → DB client
  data.ts                → Public-facing query helpers
  settings.ts             → Site settings reader (auto-creates defaults)
  auth.ts / auth-server.ts / api-auth.ts → Auth helpers
  email.ts                 → Contact form mailer
prisma/
  schema.prisma            → Full data model
  seed.ts                    → Starter content + admin user
```

## CRM Features (Admin Panel)

- **Auto-captured leads** — every Contact form submission becomes a Lead automatically
- **Kanban pipeline** — New → Qualifying → Proposal Sent → Won / Lost
- **Deal fields** — phone, company, estimated deal value, internal notes (editable per lead)
- **Ads & Tracking** — Meta Pixel + Google Ads conversion tracking, fires a "Lead" event on
  successful form submission (configured in Admin → Settings → Ads & Tracking)

## External API (for ARQ Software / other systems)

`app/api/external/v1/*` exposes read-only, API-key-protected endpoints so an external system
can pull data from this site:

| Endpoint | Scope required |
|---|---|
| `GET /api/external/v1/leads` | `leads:read` |
| `GET /api/external/v1/services` | `services:read` |
| `GET /api/external/v1/portfolio` | `portfolio:read` |
| `GET /api/external/v1/blog` | `blog:read` |
| `GET /api/external/v1/team` | `team:read` |
| `GET /api/external/v1/testimonials` | `testimonials:read` |

Authenticate with `Authorization: Bearer <api_key>`. Create and manage keys from
**Admin → API Keys** — the raw key is shown once at creation and never stored (only its
SHA-256 hash is kept), so treat it like a password.

Response shape: `{ "data": [...], "meta": { "count": N, "authenticated_as": "Key Name" }, "errors": null }`

## Getting Started (Local Development)

See `DEPLOYMENT.md` for full VPS deployment instructions. For local dev:

```bash
npm install
# For local dev only, any MySQL 8 instance works — e.g. run one via Docker:
#   docker run -d --name agency-mysql -e MYSQL_ROOT_PASSWORD=root \
#     -e MYSQL_DATABASE=agency_db -p 3306:3306 mysql:8
cp .env.example .env    # set DATABASE_URL to your local MySQL instance
npx prisma migrate dev
npx prisma db seed
npm run dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login
  (default: `admin@arvance.agency` / value of `SEED_ADMIN_PASSWORD` env var,
  or `ChangeMe123!` if unset)

## Hosting

Two supported deployment paths, both documented in full:

- **`DEPLOYMENT-HOSTINGER-BUSINESS.md`** — Hostinger Business/Cloud plan
  (managed Node.js app, MySQL, no Docker/root required). **This is the
  recommended path for this project.**
- **`DEPLOYMENT.md`** — Any VPS with Docker (full control, same MySQL schema
  as the Business plan path — no code changes needed to switch).

Local development works the same either way (see above) — it's only the
production deployment steps that differ.

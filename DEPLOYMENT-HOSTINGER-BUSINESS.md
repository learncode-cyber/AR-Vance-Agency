# Deploying to Hostinger Business Plan (Node.js Web App)

This guide is for hosting on **Hostinger Business** (or any Cloud plan) —
shared/managed hosting with Node.js app support. It does **not** use Docker
(not available on this plan tier). For a VPS + Docker deployment instead,
see `DEPLOYMENT.md`.

## What's Different on Business Plan

| | VPS (DEPLOYMENT.md) | Business Plan (this guide) |
|---|---|---|
| Database | MySQL (self-managed via Docker) | **MySQL** (Hostinger-managed) |
| Runtime | Docker container | Hostinger's managed Node.js app (Passenger) |
| Access | Full root SSH | SSH access (enable manually), no root |
| Reverse proxy | Nginx (self-managed) | Handled automatically by hPanel |

The codebase already targets MySQL (`prisma/schema.prisma` uses
`provider = "mysql"`), so no schema changes are needed for this path.

## Step 1 — Create the MySQL Database

1. Log into **hPanel** → your website → **Databases → MySQL Databases**
2. Create a new database and a database user; note down:
   - Database name
   - Username
   - Password
   - Host (usually `localhost`)

## Step 2 — Enable SSH Access

1. hPanel → your website → **Advanced → SSH Access**
2. Toggle it on, set an SSH password if prompted
3. Note the SSH hostname/port shown (often a custom port, not 22)

You'll use this to run one-time setup commands (`prisma migrate`, `prisma db
seed`) that Hostinger's Node.js panel doesn't run automatically.

## Step 3 — Create the Node.js Web App

1. hPanel → **Websites → Add Website** (or your existing site) → **Node.js**
2. Choose deployment method:
   - **GitHub integration** (recommended) — connect this repo, auto-deploys on push
   - **Upload a .zip** of the project (excluding `node_modules`)
3. Set:
   - **Node.js version:** 20.x
   - **Application root:** the folder containing `package.json`
   - **Application startup file:** not applicable for Next.js — instead set
     **Start command:** `npm run start`
   - **Build command:** `npm run build`

## Step 4 — Set Environment Variables

In the Node.js app's **Environment Variables** section in hPanel, add every
value from `.env.example`, using the MySQL credentials from Step 1:

```
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
JWT_SECRET=<generate with: openssl rand -base64 32>
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
MAIL_TO=hello@yourdomain.com
SEED_ADMIN_PASSWORD=<choose a strong password>
```

## Step 5 — First Deploy + Database Setup

After the first deploy completes (via GitHub push or zip upload + hPanel's
"Deploy" button), SSH in to run the one-time database setup:

```bash
ssh -p <port> <username>@<ssh-host>
cd ~/domains/yourdomain.com/public_html   # path shown in hPanel Node.js app info

npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

This creates all tables and seeds starter content + your admin login
(`admin@arvance.agency` / the `SEED_ADMIN_PASSWORD` you set).

## Step 6 — Verify

- Visit `https://yourdomain.com` — public site should load
- Visit `https://yourdomain.com/admin/login` — log in with the seeded admin
- Test the contact form — check it arrives by email and appears under
  **Leads** in the admin panel

## Deploying Updates

- **GitHub integration:** just `git push` — Hostinger auto-builds and restarts
- **Zip upload:** re-upload and click "Deploy" in hPanel

If you changed `prisma/schema.prisma`, SSH in and run
`npx prisma migrate deploy` again after the new code is live.

## Server-Side Conversion Tracking (Meta CAPI + Google Ads API + GA4)

All of these are configured entirely from **Admin → Settings** — no code or
redeploy needed once the app is live. Every field has an inline hint
explaining exactly where to find the value in Meta/Google's dashboards.

### Meta Conversions API
1. Meta Events Manager → your Pixel → **Settings** → **Conversions API** → **Generate access token**
2. Paste the Pixel ID (Ads & Tracking card) and Access Token (Meta Conversions API card) into Admin → Settings
3. Optional: paste a **Test Event Code** temporarily, submit a test lead, confirm it
   appears in Events Manager → **Test Events**, then remove the code for production

### GA4 Measurement Protocol
1. GA4 Admin → **Data Streams** → your web stream → **Measurement Protocol API secrets** → **Create**
2. Paste the Measurement ID and the new API Secret into Admin → Settings

### Google Ads API (requires Google's approval — do this first, it takes time)
1. **Apply for a Developer Token**: Google Ads account → Tools & Settings →
   **API Center** → apply. Basic access is usually approved within a few
   days for an active advertiser account; approval time varies.
2. **Create OAuth credentials**: [Google Cloud Console](https://console.cloud.google.com)
   → create/select a project → **APIs & Services → Credentials** →
   **Create OAuth Client ID** → type **Web application** →
   under **Authorized redirect URIs** add exactly:
   ```
   https://yourdomain.com/api/admin/google-ads/callback
   ```
   (must match your real domain exactly, including `https://`)
3. Copy the **Client ID** and **Client Secret** into Admin → Settings →
   Google Ads API card, along with your **Customer ID** (Ads account ID,
   digits only) and the **Conversion Action ID** (Google Ads → Goals →
   Conversions → your conversion action)
4. Click **Save Changes**, then click **Connect Google Ads Account** —
   you'll be sent to Google to authorize access and returned here
   automatically with a "Connected" status
5. From this point on, every lead that arrives with a `gclid` (i.e. they
   clicked a Google Ad) automatically gets its conversion uploaded

### How to verify it's working
Admin → Dashboard shows a **Server-Side Conversion Delivery** panel once
any lead has attempted delivery — "X / Y delivered" per platform. If a
delivery fails, open that lead in the Leads pipeline; the failure reason is
stored (visible via Prisma Studio's `Lead.metaCapiStatus` /
`googleAdsStatus` / `ga4Status` columns) for debugging.



Uploaded images (Blog covers, Portfolio images, Team photos) are stored in
**Cloudflare R2** by default configuration path — this keeps them safe
across redeploys, unlike storing them on the server's local disk.

**One-time setup (free tier is generous — 10GB storage, no egress fees):**

1. Sign up / log in at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **R2 Object Storage** → **Create bucket** (name it e.g. `agency-uploads`)
3. In the bucket → **Settings** → **Public Access** → enable it, copy the
   public `r2.dev` URL (or connect a custom domain like `media.yourdomain.com`)
4. Go to **R2 → Manage API Tokens** → **Create API Token** → permission
   **Object Read & Write**, scoped to this bucket → copy the Access Key ID
   and Secret Access Key (shown once)
5. Your **Account ID** is shown on the R2 Overview page (right sidebar)
6. Add these to your app's environment variables:
   ```
   R2_ACCOUNT_ID=<your account id>
   R2_ACCESS_KEY_ID=<from step 4>
   R2_SECRET_ACCESS_KEY=<from step 4>
   R2_BUCKET_NAME=agency-uploads
   R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev
   ```
7. Restart the app — new uploads now go to R2 automatically.

**If you skip this setup:** uploads still work, but fall back to local disk
storage — which can be wiped on a full redeploy (see note below). R2 is a
10-minute one-time setup that removes this risk entirely.

⚠️ **Only if R2 is not configured:** images fall back to `public/uploads/`
on the server. This folder is **not** part of your Git repo, so a fresh
GitHub deploy that re-clones the repo, or a zip re-upload that replaces the
whole app folder, can wipe it. Back it up periodically (see Backups below).

## Backups

hPanel → **Databases → phpMyAdmin** → export, or via SSH:

```bash
mysqldump -u DB_USER -p DB_NAME > backup-$(date +%F).sql

# Also back up uploaded images (not stored in the database or Git):
tar -czf uploads-backup-$(date +%F).tar.gz public/uploads/
```

Hostinger Business plans also include automated daily backups — confirm
this is enabled in hPanel → **Backups**.

## Limitations to Be Aware Of

- No background workers / cron-based queue processing beyond what hPanel's
  cron jobs support (Settings → Advanced → Cron Jobs, if you later need
  scheduled tasks like nightly report generation)
- No Docker, no Redis — this app doesn't require either, so nothing is lost
  for the current feature set
- If the agency later needs heavier background processing (the automation
  layer discussed for Phase 4 of the original roadmap), that would need a
  VPS — which is exactly what your ARQ Software VPS is reserved for

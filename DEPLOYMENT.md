# AR Vance Agency — VPS Deployment Guide (Docker)

This guide is for deploying on a **VPS with root access and Docker**
(e.g. your ARQ Software VPS, DigitalOcean, Hetzner). If you're deploying to
**Hostinger Business/Cloud hosting** instead (no root/Docker), use
`DEPLOYMENT-HOSTINGER-BUSINESS.md` instead — that is the currently
recommended path for this project.

This stack uses **MySQL** (matching `prisma/schema.prisma`) so the same
codebase deploys identically whether it ends up on a VPS or on Hostinger
Business hosting.

## Requirements

- A VPS with **root/SSH access** and **Docker support**
- A domain name pointed at the VPS's IP address (A record)
- Minimum specs: 1 vCPU, 2GB RAM

## First-Time VPS Setup

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone / upload this project
git clone <your-repo-url> /opt/agency-platform
cd /opt/agency-platform

# 4. Create your .env file
cp .env.example .env
nano .env   # fill in real values — see below

# 5. Point nginx/nginx.conf at your real domain
#    (replace "yourdomain.com" throughout the file)
nano nginx/nginx.conf
```

## Required .env Values

| Variable | Description |
|---|---|
| `DATABASE_URL` | `mysql://agency:<DB_PASSWORD>@mysql:3306/agency_db` (use the same password as `DB_PASSWORD` below) |
| `DB_PASSWORD` | MySQL password for the `agency` user (used by docker-compose.yml) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `JWT_SECRET` | Random 32+ character string — generate with `openssl rand -base64 32` |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Your email provider's SMTP credentials (for the contact form) |
| `MAIL_TO` | Where contact form notifications should be sent |
| `SEED_ADMIN_PASSWORD` | The password for your first admin login (only used during seeding) |

## First Deploy

```bash
# 1. Get an SSL certificate (before starting nginx with SSL config)
docker run -it --rm \
  -v "$(pwd)/nginx/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/nginx/certbot/www:/var/www/certbot" \
  -p 80:80 certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com

# 2. Build and start everything
docker compose up -d --build

# 3. Run database migrations
docker compose exec app npx prisma migrate deploy

# 4. Seed starter content (services, sample blog posts, admin user)
docker compose exec app npx prisma db seed

# 5. Verify
curl https://yourdomain.com
```

Your admin panel is now live at `https://yourdomain.com/admin/login`.
Log in with the email set in `prisma/seed.ts` (`admin@arvance.agency` by
default) and the password from `SEED_ADMIN_PASSWORD`.

**Change the admin password immediately after first login.**

## Renewing SSL (every ~90 days)

```bash
docker run -it --rm \
  -v "$(pwd)/nginx/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/nginx/certbot/www:/var/www/certbot" \
  certbot/certbot renew

docker compose restart nginx
```

## Deploying Updates

```bash
cd /opt/agency-platform
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy   # if schema changed
```

## Backups

```bash
# Manual backup
docker compose exec mysql sh -c 'exec mysqldump -u agency -p"$MYSQL_PASSWORD" agency_db' > backup-$(date +%F).sql

# Restore
cat backup-2026-01-01.sql | docker compose exec -T mysql mysql -u agency -p agency_db
```

Set up a nightly cron job running the backup command above, and copy the
resulting file off the VPS.

## Local Development

```bash
npm install
docker compose up -d mysql   # just the database
cp .env.example .env         # set DATABASE_URL to localhost:3306
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin panel.

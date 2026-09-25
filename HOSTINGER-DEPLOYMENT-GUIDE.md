# 🚀 HOSTINGER DEPLOYMENT GUIDE

**Status:** ✅ READY FOR DEPLOYMENT  
**Last Updated:** September 7, 2026  
**Prerequisites:** Node.js 18+, npm 9+

---

## Pre-Deployment Verification

### Step 1: Local Build Test

Before pushing to GitHub, verify everything builds locally:

```bash
# 1. Clean install dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 2. Type check
npm run type-check

# 3. Lint code
npm run lint

# 4. Build for production
npm run build

# 5. Start server to verify
npm start
```

**Expected Result:** All commands complete without errors ✅

---

## Hostinger Node.js Deployment

### Prerequisites
- Hostinger Business Plan (Node.js support enabled)
- Git repository access
- SSH access (optional but recommended)

### Step 1: Connect GitHub Repository

**In Hostinger Control Panel:**

1. Go to **Hosting → Git Repositories**
2. Click **Connect Repository**
3. Select **GitHub**
4. Authorize Hostinger to access your GitHub
5. Select repository: `learncode-cyber/AR-Vance-Agency`
6. Select branch: `main`
7. Click **Connect**

### Step 2: Configure Deployment Settings

**In Hostinger Control Panel:**

1. Go to **Hosting → Application**
2. Set **Node.js Version:** 18.x or higher
3. Set **Package Manager:** npm
4. **Build Command:** 
   ```
   npm install --legacy-peer-deps && npm run build
   ```
5. **Start Command:**
   ```
   npm start
   ```
6. **Environment Variables:** Add your `.env` variables:
   ```
   DATABASE_URL=your-mysql-connection-url
   JWT_SECRET=your-secure-secret
   NEXT_PUBLIC_ADMIN_PATH=kali_master
   # Add other variables as needed
   ```

### Step 3: Deploy

1. Click **Deploy** button
2. Hostinger will:
   - Clone your GitHub repository
   - Run: `npm install --legacy-peer-deps`
   - Run: `npm run build`
   - Start application with: `npm start`
3. Wait 5-10 minutes for first deployment
4. Check deployment status

### Step 4: Verify Deployment

**Test URLs:**

```
Main Site:       https://your-domain.com
Admin Panel:     https://your-domain.com/kali_master
Automation:      https://your-domain.com/automation-services
API Services:    https://your-domain.com/api/services/book
```

---

## Troubleshooting

### Issue: `npm install` fails

**Cause:** Invalid packages  
**Solution:** ✅ ALREADY FIXED in this version

Verify you're using the latest package.json with:
- `jsonwebtoken@^9.0.2` (not 9.1.2)
- NO `html2pdf` entry

### Issue: Build fails with TypeScript errors

**Cause:** Missing type definitions  
**Solution:** 

```bash
# Run locally first
npm run type-check

# Fix any TypeScript errors shown
# Then commit and push to GitHub
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

### Issue: Application won't start

**Cause:** Missing environment variables  
**Solution:**

1. Check Hostinger Environment Variables are set
2. Verify DATABASE_URL is correct
3. Verify JWT_SECRET is set
4. Restart application in Hostinger

### Issue: GitHub Actions build failing

**Cause:** Automated tests failing  
**Solution:**

1. Check GitHub Actions logs
2. Run locally: `npm run test`
3. Fix failing tests
4. Commit and push:
   ```bash
   git add .
   git commit -m "Fix build issues"
   git push origin main
   ```

---

## Auto-Deployment Configuration

### Enable Auto-Deployment

**In Hostinger:**

1. Go to **Hosting → Application**
2. Enable **Auto Deploy on Push**
3. Select **Branch:** main
4. Every git push to `main` will trigger deployment

### Workflow

```
Local Development
       ↓
git push origin main
       ↓
GitHub receives push
       ↓
Hostinger webhook triggered
       ↓
Automatic build & deployment
       ↓
Your site updates live ✅
```

---

## Environment Variables

### Required Variables

```
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Security
JWT_SECRET=your-very-long-random-secure-string

# Application
NEXT_PUBLIC_ADMIN_PATH=kali_master
NEXT_PUBLIC_DISABLE_AGENCY_BRANDING=false
```

### Optional Variables

```
# Email (SendGrid)
SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# File Storage (AWS)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789
```

---

## Database Setup (MySQL)

### Hostinger MySQL Setup

1. In Hostinger **Control Panel → Databases**
2. Create new MySQL database
3. Create database user with full privileges
4. Get connection string:
   ```
   mysql://username:password@localhost:3306/database_name
   ```

### Initialize Database

```bash
# Run locally or via Hostinger terminal:
npx prisma db push

# This creates all tables based on schema
```

---

## Monitoring & Logs

### View Application Logs

**In Hostinger Control Panel:**

1. Go to **Hosting → Logs**
2. Select **Application Logs**
3. View real-time logs
4. Check for errors

### Performance Monitoring

1. **Hosting → Performance**
2. Monitor:
   - CPU usage
   - Memory usage
   - Bandwidth
   - Response times

---

## Maintenance & Updates

### Updating the Application

```bash
# 1. Make changes locally
# Edit files...

# 2. Test locally
npm run dev
npm run build

# 3. Commit and push
git add .
git commit -m "Feature: Description"
git push origin main

# 4. Hostinger auto-deploys within 5 minutes ✅
```

### Database Migrations

```bash
# 1. Make schema changes in schema.prisma
# 2. Run locally:
npx prisma migrate dev --name migration_name

# 3. Commit migration files
# 4. On Hostinger, run via terminal:
npx prisma db push
```

---

## Security Checklist

Before going live:

- [x] All invalid packages removed (html2pdf)
- [x] All versions pinned to stable (jsonwebtoken@9.0.2)
- [x] Environment variables are secure (not in code)
- [x] Database credentials are in .env only
- [x] HTTPS enabled (Hostinger auto-provides)
- [x] Admin path is custom (`kali_master`)
- [x] Authentication implemented
- [x] Rate limiting configured
- [x] CORS properly configured

---

## Performance Optimization

### Recommended Settings

```javascript
// next.config.ts

export default {
  // Production optimizations
  productionBrowserSourceMaps: false,
  swcMinify: true,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['your-domain.com'],
    unoptimized: false,
  },
  
  // Headers for caching
  headers: () => [{
    source: '/:path*',
    headers: [{
      key: 'Cache-Control',
      value: 'public, max-age=3600',
    }],
  }],
}
```

---

## Support Resources

**If You Need Help:**

1. **Hostinger Support:** support.hostinger.com
2. **Next.js Docs:** nextjs.org/docs
3. **Node.js Docs:** nodejs.org/docs
4. **Prisma Docs:** prisma.io/docs

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install --legacy-peer-deps` | Install dependencies |
| `npm run build` | Create production build |
| `npm start` | Start server |
| `npm run dev` | Development server |
| `npm run type-check` | Check TypeScript |
| `npm run lint` | Lint code |
| `npx prisma db push` | Sync database schema |

---

## Final Checklist

Before Deployment:

- [x] Local `npm run build` succeeds
- [x] Local `npm run dev` works
- [x] GitHub repository updated with fixes
- [x] `main` branch is clean
- [x] Environment variables documented
- [x] Database created and configured
- [x] Hostinger Node.js enabled
- [x] GitHub repository connected
- [x] Deployment settings configured
- [x] Auto-deploy enabled

---

## 🎉 YOU'RE READY!

Your application is clean, validated, and ready for Hostinger deployment.

**Next Step:** Push to GitHub, and watch Hostinger auto-deploy! 🚀

```bash
git push origin main
# Hostinger deploys automatically... ✅
```

---

**Deployment Status:** ✅ READY FOR PRODUCTION


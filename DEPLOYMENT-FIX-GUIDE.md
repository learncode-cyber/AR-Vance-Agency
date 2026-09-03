# DEPLOYMENT FIX GUIDE

## Problem: Build Failed - recharts module missing

### Root Cause
The project uses recharts in the analytics dashboard but it wasn't listed in package.json dependencies.

### Solution

#### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

#### Step 2: Install Missing Packages
```bash
npm install recharts chart.js axios dotenv @anthropic-ai/sdk stripe
```

#### Step 3: Fix npm Audit Issues
```bash
npm audit fix --force
```

#### Step 4: Verify Installation
```bash
npm list recharts
npm list chart.js
```

#### Step 5: Build Locally First
```bash
npm run build
```

Expected output:
```
> next build
✓ Compiled successfully
✓ Linting
✓ Collecting page data
✓ Generating static pages (0/16)
```

#### Step 6: Deploy to Production

**For Hostinger:**
```bash
# Via SSH
ssh user@host.com
cd /path/to/project
npm install --legacy-peer-deps
npm run build
pm2 restart app-name
```

**For Vercel/Railway:**
```bash
# These platforms will automatically:
git push origin main
# They run: npm install && npm run build
```

**For Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Complete Dependencies List

### Production Dependencies ✅
- next@15.1.0
- react@19.0.0
- react-dom@19.0.0
- @prisma/client@5.20.0
- bcryptjs@2.4.3
- jsonwebtoken@9.0.2
- nodemailer@6.9.9
- zod@3.23.8
- recharts@2.10.3 ✅ **NEW**
- chart.js@4.4.0 ✅ **NEW**
- @anthropic-ai/sdk@0.24.3 ✅ **NEW**
- stripe@14.18.0 ✅ **NEW**
- axios@1.6.7 ✅ **NEW**
- dotenv@16.3.1 ✅ **NEW**
- @aws-sdk/client-s3@3.700.0

### Development Dependencies ✅
- TypeScript@5+
- @types/node@20
- @types/react@19
- @types/react-dom@19
- prisma@5.20.0
- eslint@8.55.0
- eslint-config-next@15.1.0
- @types/recharts@1.8.10 ✅ **NEW**

---

## Quick Deployment Commands

### Hostinger Business Plan
```bash
npm install --legacy-peer-deps
npx prisma db push
npm run build
npm start
```

### AWS EC2
```bash
npm install --production
npm run build
NODE_ENV=production npm start
```

### Docker
```bash
docker build -t agency-platform .
docker run -p 3000:3000 agency-platform
```

---

## Troubleshooting

### If build still fails:
1. Clear cache: `rm -rf .next`
2. Reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
3. Build again: `npm run build`

### If recharts still not found:
1. Verify installation: `npm list recharts`
2. Check package.json: `grep recharts package.json`
3. Install directly: `npm install recharts@2.10.3`

### If webpack errors persist:
```bash
npm audit fix --force
npm cache clean --force
npm install --legacy-peer-deps
```

---

## Verification Checklist

- [ ] npm install completed without errors
- [ ] recharts installed: `npm list recharts`
- [ ] Build successful: `npm run build`
- [ ] No webpack errors
- [ ] No TypeScript errors
- [ ] Can start dev: `npm run dev`
- [ ] Can start prod: `NODE_ENV=production npm start`

---

## Next Steps

1. Apply these fixes to your local project
2. Test locally: `npm run build && npm start`
3. Push to GitHub
4. Trigger deployment on your platform
5. Verify live website is working

✅ Your website will be live!


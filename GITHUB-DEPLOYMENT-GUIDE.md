# GitHub থেকে Deploy করার সম্পূর্ণ গাইড

## ✅ Step 1: GitHub Repository Setup

### 1.1 Repository Create করুন
```bash
git init
git add .
git commit -m "Initial commit: AR Vance Agency Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ar-vance-agency-platform.git
git push -u origin main
```

### 1.2 GitHub Settings এ যান
- Repository Settings → Secrets and variables → Actions

### 1.3 Secrets Add করুন
```
DATABASE_URL = mysql://user:password@host/database
JWT_SECRET = your-secret-key-here
ANTHROPIC_API_KEY = sk-xxx...
VERCEL_TOKEN = vercel_xxxx...
VERCEL_ORG_ID = xxx...
VERCEL_PROJECT_ID = xxx...
STRIPE_API_KEY = sk_live_xxx...
NEXT_PUBLIC_ADMIN_PATH = kali_master
```

---

## ✅ Step 2: Vercel Setup (সবচেয়ে সহজ)

### 2.1 Vercel Account Create করুন
- https://vercel.com এ যান
- Sign up করুন

### 2.2 GitHub Connect করুন
1. Vercel Dashboard → Import Project
2. "From Git Repository" select করুন
3. GitHub account connect করুন
4. Your repository select করুন

### 2.3 Environment Variables Configure করুন
Vercel Dashboard এ:
- Project Settings → Environment Variables
- সব secrets add করুন

### 2.4 Deploy করুন
```
Vercel automatically deploys on push to main branch
```

---

## ✅ Step 3: Local Setup & Push

### 3.1 Clone করুন (নিজের local machine এ)
```bash
git clone https://github.com/YOUR_USERNAME/ar-vance-agency-platform.git
cd ar-vance-agency-platform
```

### 3.2 Dependencies Install করুন
```bash
npm install --legacy-peer-deps
```

### 3.3 Environment Variables Setup করুন
```bash
cp .env.example .env
# Edit .env with your values
```

### 3.4 Database Setup করুন
```bash
npx prisma migrate dev
# Or: npx prisma db push
```

### 3.5 Development Mode এ Run করুন
```bash
npm run dev
# Visit: http://localhost:3000
```

### 3.6 Changes করার পর Push করুন
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Vercel automatically deploys! ✅**

---

## ✅ Step 4: Troubleshooting

### Problem: "recharts not found"
**Solution:** Already fixed in updated package.json
```bash
npm install --legacy-peer-deps
```

### Problem: Prisma migration error
**Solution:**
```bash
# Clear prisma cache
rm -rf node_modules/.prisma
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
```

### Problem: Environment variables not working
**Solution:**
1. Vercel Dashboard এ variables check করুন
2. Build settings restart করুন
3. Redeploy করুন

### Problem: Build fails on Vercel
**Solution:**
```bash
# Local এ build করে check করুন
npm run build

# Error থাকলে fix করুন
npm install --legacy-peer-deps
npm run build
```

---

## ✅ Step 5: Database Connection (Vercel এ)

### Option A: Managed Database (সহজ)
1. Vercel Dashboard → Storage
2. Create Database (MySQL)
3. Copy CONNECTION_STRING
4. Add to .env: `DATABASE_URL=mysql://...`

### Option B: External Database (Hostinger/AWS)
1. Create MySQL database on Hostinger
2. Get connection string
3. Add to Vercel environment variables

---

## ✅ Step 6: Custom Domain (Optional)

### 6.1 Vercel এ Domain Add করুন
1. Project Settings → Domains
2. "Add Domain" click করুন
3. Your domain এর DNS settings update করুন

### 6.2 DNS Configuration
```
CNAME: your-domain.com → cname.vercel-dns.com
```

---

## 📋 চেকলিস্ট

- [ ] GitHub Repository created
- [ ] Secrets added to GitHub
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Environment variables configured
- [ ] Database created
- [ ] Local setup completed
- [ ] `npm install --legacy-peer-deps` run করা হয়েছে
- [ ] `npm run build` successful
- [ ] Changes pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Website access করতে পারছেন

---

## 🚀 Quick Deploy Commands

```bash
# Setup
git clone https://github.com/YOUR_USERNAME/ar-vance-agency-platform.git
cd ar-vance-agency-platform
npm install --legacy-peer-deps
cp .env.example .env

# Development
npm run dev

# Production build
npm run build
npm start

# Push to GitHub (Auto deploy to Vercel)
git add .
git commit -m "Update"
git push origin main
```

---

## 🆘 Support

**Errors face করলে:**
1. Local build test করুন: `npm run build`
2. GitHub Actions log check করুন
3. Vercel deployment log check করুন
4. Console এ error দেখুন (Vercel Dashboard)

---

**Happy Deployment! 🎉**


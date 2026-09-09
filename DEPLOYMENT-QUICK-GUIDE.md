# 🚀 Deployment to Production - 10 Minutes

## Option 1: Vercel (Recommended - Easiest)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Automation Services Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/automation-services.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. "New Project" → Select your GitHub repo
3. Click "Deploy"

**That's it! Your site is live!**

### Step 3: Add Environment Variables
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Redeploy (Vercel button → Redeploy)

---

## Option 2: Self-Hosted (AWS / DigitalOcean / Hostinger)

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Step 3: Start Application
```bash
pm2 start npm --name "automation" -- start
pm2 save
pm2 startup
```

### Step 4: Setup Nginx (Reverse Proxy)
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

---

## Environment Variables Checklist

Before deploying, fill in:

```
✅ DATABASE_URL
✅ JWT_SECRET
✅ SENDGRID_API_KEY (optional)
✅ AWS_ACCESS_KEY_ID (optional)
✅ NEXT_PUBLIC_GA4_ID (optional)
✅ NEXT_PUBLIC_META_PIXEL_ID (optional)
✅ NEXT_PUBLIC_HCAPTCHA_SITE_KEY (optional)
```

Optional ones can be empty initially - platform still works!

---

## Verify Deployment

1. Visit your deployed URL
2. Navigate to `/automation-services`
3. Fill and submit booking form
4. Check browser console (F12) for no errors
5. Check Vercel logs for backend errors

---

**Boom! You're deployed!** 🎉


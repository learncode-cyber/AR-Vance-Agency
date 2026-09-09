# 🚀 Automation Services Platform - Complete Setup Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Cloud Storage Integration](#cloud-storage-integration)
3. [Email Service Setup](#email-service-setup)
4. [Bot Protection](#bot-protection)
5. [Analytics Configuration](#analytics-configuration)
6. [Deployment](#deployment)
7. [Testing](#testing)

---

## Environment Setup

### 1. Copy Environment Variables
```bash
cp .env.example .env.local
```

### 2. Fill in Required Variables

#### Database
```
DATABASE_URL="mysql://user:password@localhost:3306/agency_db"
```

#### JWT Secret (Generate new)
```bash
# Generate secure JWT secret
openssl rand -base64 32
```

---

## Cloud Storage Integration

### Option A: AWS S3

#### Step 1: Create AWS S3 Bucket
1. Go to https://console.aws.amazon.com/
2. Create a new S3 bucket
3. Enable versioning (optional)
4. Block public access

#### Step 2: Create IAM User
1. Go to IAM → Users → Create User
2. Attach policy: `AmazonS3FullAccess`
3. Create access key
4. Save Access Key ID & Secret Access Key

#### Step 3: Add to .env
```
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### Option B: Firebase Storage

#### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Storage

#### Step 2: Generate Service Account Key
1. Project Settings → Service Accounts
2. Generate New Private Key
3. Download JSON file

#### Step 3: Add to .env
```
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
```

---

## Email Service Setup

### SendGrid

#### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/
2. Sign up (free tier available)

#### Step 2: Generate API Key
1. Settings → API Keys
2. Create New Dynamic Template API Key

#### Step 3: Create Email Template
1. Dynamic Templates → Create Template
2. Template name: "Booking Confirmation"
3. Add variables: {{fullName}}, {{service}}, {{date}}

#### Step 4: Add to .env
```
SENDGRID_API_KEY="your-api-key"
SENDGRID_FROM_EMAIL="noreply@your-domain.com"
```

---

## Bot Protection

### hCaptcha Setup

#### Step 1: Create hCaptcha Account
1. Go to https://www.hcaptcha.com/
2. Sign up and verify email

#### Step 2: Get Site Keys
1. Dashboard → New Site
2. Add your domain
3. Copy Site Key & Secret Key

#### Step 3: Add to .env
```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="your-site-key"
HCAPTCHA_SECRET_KEY="your-secret-key"
```

#### Step 4: Implement in Form
```tsx
import HCaptcha from '@hcaptcha/react-hcaptcha';

<HCaptcha
  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
  onVerify={handleVerify}
/>
```

---

## Analytics Configuration

### Google Analytics 4 (GA4)

#### Step 1: Create GA4 Property
1. Go to https://analytics.google.com/
2. Create New Property
3. Set up as Web

#### Step 2: Get Measurement ID
1. Admin → Property → Data Streams
2. Copy Measurement ID (format: G-XXXXXXXXXX)

#### Step 3: Add to .env
```
NEXT_PUBLIC_GA4_ID="G-XXXXXXXXXX"
```

#### Step 4: Install gtag
```bash
npm install @react-google-analytics/core
```

### Meta Pixel

#### Step 1: Get Pixel ID
1. Go to https://business.facebook.com/
2. Events Manager → Pixels
3. Copy Pixel ID

#### Step 2: Add to .env
```
NEXT_PUBLIC_META_PIXEL_ID="123456789"
```

#### Step 3: Install Meta Pixel
```bash
npm install react-facebook-pixel
```

---

## Deployment

### Vercel Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
vercel
```

#### Step 3: Add Environment Variables
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add all variables from .env.local

#### Step 4: Redeploy
```bash
vercel --prod
```

### GitHub Actions (Optional)

Auto-deploy on git push (workflow already configured in `.github/workflows/deploy.yml`)

---

## Testing

### Local Testing

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Visit http://localhost:3000/automation-services
```

### Test Booking Form
1. Fill in all fields
2. Submit form
3. Check console for success message
4. Verify data in database (or logs)

### Test File Upload
1. Try uploading various file types
2. Test 5MB+ files (should be rejected)
3. Upload valid image/PDF
4. Check live preview works

### Test Analytics
1. Open browser DevTools → Network
2. Submit form
3. Look for GA4 and Meta Pixel requests

---

## Troubleshooting

### File Upload Not Working
- Check file size < 5MB
- Verify MIME types (jpg, png, pdf)
- Check S3/Firebase credentials
- Review browser console for errors

### Email Not Sending
- Verify SendGrid API key
- Check sender email is verified
- Review SendGrid activity log

### Analytics Not Tracking
- Verify GA4 ID and Meta Pixel ID
- Check browser console for errors
- Wait 24 hours for GA4 to show data
- Use Meta Pixel Helper extension

### Bot Protection Issues
- Verify hCaptcha keys are correct
- Test in different browser
- Check hCaptcha account status

---

## Production Checklist

- [ ] All environment variables filled
- [ ] Database migrated
- [ ] AWS S3 / Firebase configured
- [ ] Email service working
- [ ] hCaptcha activated
- [ ] GA4 tracking enabled
- [ ] Meta Pixel active
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Backups enabled

---

## Support

For issues, check:
1. Console logs
2. Network tab in DevTools
3. Service provider dashboards
4. Environment variables

---

**Ready to deploy! 🚀**


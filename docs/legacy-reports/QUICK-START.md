# ⚡ Quick Start Guide - 5 Minutes to Running

## 1. Extract & Install (2 minutes)

```bash
# Extract ZIP
unzip AUTOMATION-SERVICES-PLATFORM-COMPLETE.zip
cd agency-platform

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local
```

## 2. Run Locally (1 minute)

```bash
npm run dev
```

Open: **http://localhost:3000/automation-services**

## 3. Test the Platform (2 minutes)

### Test Service Booking Form:
1. Click "Book Service" button
2. Fill in the form fields
3. Submit (data saved to browser LocalStorage)
4. Refresh page - data still there!

### Test Company Application:
1. Click floating "✨ Join Now" button
2. Fill company information
3. Upload a test image or PDF
4. See live preview
5. Submit

### Test File Upload:
- Drag & drop an image/PDF
- See live preview
- File size validation works
- Try uploading >5MB file (rejected)

## What Works WITHOUT Setup:

✅ All UI components
✅ Form validation
✅ File upload
✅ File preview
✅ Form data persistence
✅ Routing between sections

## What Needs Setup (30 minutes):

⚠️ Email sending → needs SendGrid
⚠️ File storage → needs AWS S3/Firebase
⚠️ Bot protection → needs hCaptcha
⚠️ Analytics → needs GA4 ID + Meta Pixel ID

See: `AUTOMATION-SERVICES-SETUP.md` for full setup guide

---

**That's it! You have a working platform!** 🚀


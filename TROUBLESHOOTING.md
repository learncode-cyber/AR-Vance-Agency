# 🔧 Troubleshooting Guide

## "npm install" fails

**Error:** `peer dep missing` or `ERR!`

**Solution:**
```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required for this project.

---

## Form won't submit

**Symptom:** Submit button does nothing

**Check:**
1. Open Browser Console (F12)
2. Look for error messages
3. Check Network tab → see if API call made

**Common Causes:**
- Missing required fields (red error text appears)
- Email format invalid
- Phone number format invalid

**Solution:** Fill all required fields (* marked)

---

## File upload not working

**Symptom:** Upload area not responsive

**Cause:** Could be several things

**Debug:**
```
1. Open Browser Console (F12)
2. Check for errors
3. Try dragging different file
4. Reload page
```

**File Requirements:**
- Format: JPG, PNG, or PDF only
- Size: Max 5MB
- Magic bytes must match extension

**Solution:**
Try uploading a valid image from your computer:
- Use `sample.jpg` or `sample.png`
- Make sure file size < 5MB

---

## Form data not persisting

**Symptom:** Refresh page and form is empty

**Cause:** LocalStorage might be disabled

**Check:**
1. F12 → Application → Local Storage
2. Should see `booking_form` key

**Solution:**
Enable LocalStorage in browser:
- Chrome: Settings → Privacy → Cookies → Allow all
- Firefox: No additional settings needed
- Safari: Preferences → Privacy → enable all

---

## Page not loading

**Symptom:** Blank page or 404 error

**Cause:** Wrong URL

**Solution:**
Correct URL is:
```
http://localhost:3000/automation-services
```

NOT `/automation` or `/services`

---

## SendGrid emails not sending

**Status:** Features requires setup

**Symptoms:**
- Form submits but no email
- User receives nothing

**Requirements:**
1. SendGrid account created
2. API key added to .env.local
3. SENDGRID_FROM_EMAIL set to verified email

**Debug:**
1. Check .env.local has SENDGRID_API_KEY
2. Verify key is correct (copy-paste it again)
3. Check SendGrid email is verified in SendGrid dashboard
4. Check spam folder

---

## File storage not working

**Status:** Feature requires setup

**Symptoms:**
- File uploads but doesn't save
- No file in cloud storage

**Requirements:**
1. AWS S3 bucket created OR Firebase project
2. Credentials added to .env.local
3. Bucket policy allows uploads

**Debug:**
1. Check credentials are correct
2. Check bucket name matches .env
3. Try uploading small image first
4. Check AWS/Firebase dashboard for uploads

---

## Analytics not tracking

**Status:** Feature requires setup

**Symptoms:**
- Form submits but no GA4/Meta Pixel events
- No conversion tracked

**Requirements:**
1. GA4 property ID obtained
2. Meta Pixel ID obtained
3. IDs added to .env.local

**Debug:**
1. Open DevTools → Network tab
2. Submit form
3. Search for `google` or `facebook` requests
4. Look for 200 status response

---

## hCaptcha not showing

**Status:** Feature requires setup

**Symptoms:**
- No captcha in form
- No bot protection

**Requirements:**
1. hCaptcha account created
2. Site key added to .env.local

**Debug:**
1. Check NEXT_PUBLIC_HCAPTCHA_SITE_KEY in .env
2. Verify site is registered in hCaptcha dashboard
3. Reload page (might need hard refresh - Ctrl+Shift+R)

---

## Slow performance

**Symptom:** Page takes >3 seconds to load

**Cause:** Could be several things

**Check:**
1. DevTools → Performance tab
2. Look for slow network requests
3. Check file sizes in Network tab

**Solutions:**
- Disable browser extensions
- Clear cache (Ctrl+Shift+Delete)
- Try different browser
- Check internet connection

---

## "Unexpected token" error

**Symptom:** JSON parse error in console

**Cause:** Response is not valid JSON

**Debug:**
1. Check Network tab → API response
2. Look for actual error message in response
3. Check backend logs

---

## Mobile layout broken

**Symptom:** Text overlapping or buttons too wide

**Check:**
1. Right-click → Inspect
2. Check DevTools responsive mode
3. Toggle device toolbar (Ctrl+Shift+M)

**Common Causes:**
- Very old browser
- Browser zoom too high
- Custom CSS overriding

**Solution:**
- Reset zoom (Ctrl+0)
- Try different browser
- Clear browser cache

---

## Still stuck?

1. Check Browser Console (F12) for error messages
2. Take screenshot of error
3. Check .env.local has all required variables
4. Try clearing browser cache and LocalStorage
5. Restart development server (Ctrl+C and `npm run dev`)

---

**If still having issues:**

Review the setup guide: `AUTOMATION-SERVICES-SETUP.md`


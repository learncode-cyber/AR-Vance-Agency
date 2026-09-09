# ✅ Testing Checklist

## Frontend Tests (Do These First)

### Services Grid
- [ ] Page loads without errors
- [ ] 6 service cards display
- [ ] Cards are responsive (mobile/tablet/desktop)
- [ ] Hover effects work
- [ ] Icons display correctly

### Service Booking Form
- [ ] All input fields appear
- [ ] Form validation works (try submitting empty)
- [ ] Phone number format validation
- [ ] Email format validation
- [ ] Date picker works (no past dates)
- [ ] Time picker works
- [ ] Submit button works
- [ ] Loading state shows during submit
- [ ] Success message appears
- [ ] Form data persists to LocalStorage
- [ ] Form data loads on page refresh

### Company Application Portal
- [ ] All input fields appear
- [ ] Legal name validation works
- [ ] Registration number validation works
- [ ] Email validation works
- [ ] Phone validation works
- [ ] File upload area appears
- [ ] Drag-and-drop works
- [ ] Click to browse works
- [ ] File size validation works (>5MB rejected)
- [ ] File type validation works (only jpg, png, pdf)
- [ ] Image preview displays
- [ ] PDF shows indicator
- [ ] File replacement works
- [ ] File removal works
- [ ] Agreement checkbox works
- [ ] Submit button works
- [ ] Success message appears

### File Upload Component
- [ ] Max file size validation
- [ ] Allowed types only
- [ ] Drag & drop UX smooth
- [ ] Preview loads quickly
- [ ] Replace file clears old preview
- [ ] Remove file resets upload

### Navigation
- [ ] All "Join Now" buttons scroll to form
- [ ] Service cards "Book Service" works
- [ ] Smooth scrolling animation
- [ ] Back to top works

### Responsive Design
- [ ] Mobile (375px width)
  - [ ] Single column layout
  - [ ] Buttons full width
  - [ ] Text readable
  
- [ ] Tablet (768px width)
  - [ ] 2-column service grid
  - [ ] Form responsive
  
- [ ] Desktop (1024px+)
  - [ ] 3-column service grid
  - [ ] Full width form
  - [ ] Proper spacing

---

## Backend Tests (After Frontend)

### Service Booking API
```bash
curl -X POST http://localhost:3000/api/services/book \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "service": "process-automation",
    "date": "2024-12-20",
    "time": "10:00"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "bookingId": "BK-1234567890"
}
```

### Company Application API
```bash
curl -X POST http://localhost:3000/api/company/apply \
  -F "companyLegalName=Test Corp" \
  -F "registrationNumber=REG123" \
  -F "authorizedRepName=John Doe" \
  -F "contactEmail=john@company.com" \
  -F "contactPhone=+1234567890" \
  -F "idFile=@path/to/file.pdf"
```

---

## Browser Console

- [ ] No JavaScript errors
- [ ] No console warnings
- [ ] Form validation messages clear
- [ ] Analytics events fire (check Network tab)

---

## Mobile Device Testing

- [ ] Test on actual mobile device
- [ ] Touch interactions work
- [ ] Form scrolling smooth
- [ ] File upload works
- [ ] No layout issues

---

## Performance

- [ ] Page loads in <2 seconds
- [ ] Form submission <1 second
- [ ] File preview loads quickly
- [ ] No layout shift during loading

---

## Accessibility

- [ ] Tab navigation works
- [ ] Form labels present
- [ ] Error messages descriptive
- [ ] Buttons have focus states
- [ ] Images have alt text

---

## Security

- [ ] No XSS vulnerabilities
  - [ ] Try `<script>alert('xss')</script>` in form fields
  
- [ ] File upload secure
  - [ ] Try uploading .exe file (should reject)
  - [ ] Try uploading >5MB (should reject)
  
- [ ] Form data doesn't expose secrets
  - [ ] Check localStorage (F12 → Application)
  - [ ] No API keys visible

---

## When All Tests Pass ✅

You're ready to deploy!


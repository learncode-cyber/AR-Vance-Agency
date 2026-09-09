# 🏢 AR Qudrix Corporate Branding System

This project implements the official **AR Qudrix Corporate Product Branding and Attribution System**.

## Overview

This system maintains consistent corporate attribution across all digital products, ensuring clarity about:

- **Product Ownership** (AR Qudrix vs. Client)
- **Parent Company Relationship** (AR Qudrix is parent company)
- **Development Attribution** (AR Vance Agency developed the product)

---

## Corporate Structure

### AR Qudrix
- **Role:** Parent Company / Product Owner
- **Website:** https://arqudrix.com
- **Relation:** Owns and operates AR Vance Agency

### AR Vance Agency
- **Role:** Digital & Technology Company / Development Partner
- **Website:** https://arvanceagency.com
- **Relation:** Subsidiary of AR Qudrix; develops products and solutions

---

## Current Configuration

**This Project:** Automation Services Platform

```
Entity Type:        Product
Ownership:          AR Qudrix
Developer:          AR Vance Agency
Attribution:        © [YEAR] Automation Services Platform
                    A Product by AR Qudrix
                    Developed by AR Vance Agency
```

---

## File Structure

### Configuration Files

```
lib/branding/
├── corporate-config.ts      # Configuration system & types
└── metadata.ts              # SEO & semantic markup

components/layout/
├── corporate-footer.tsx     # Reusable footer component
└── (old footer removed)
```

### Updated Pages

```
app/automation-services/
├── layout.tsx               # Includes CorporateFooter
├── page.tsx                 # Main page (uses layout)
```

---

## Configuration System

### Default Configuration

The default configuration is **AR Qudrix Product**:

```typescript
import { DEFAULT_AR_QUDRIX_PRODUCT } from '@/lib/branding/corporate-config';

{
  productName: 'Automation Services Platform',
  entityType: 'product',
  parentCompany: 'AR Qudrix',
  parentCompanyUrl: 'https://arqudrix.com',
  developerCompany: 'AR Vance Agency',
  developerCompanyUrl: 'https://arvanceagency.com',
  ownershipLabel: 'A Product by',
  developmentLabel: 'Developed by',
  currentYear: 2026,
}
```

### Supported Entity Types

```typescript
// 1. AR Qudrix Product (Default)
'product'
Output: © 2026 [NAME]
        A Product by AR Qudrix
        Developed by AR Vance Agency

// 2. AR Qudrix Company/Subsidiary
'company'
Output: © 2026 [NAME]
        A Company by AR Qudrix

// 3. AR Qudrix Brand
'brand'
Output: © 2026 [NAME]
        A Brand by AR Qudrix

// 4. AR Vance Agency Client Project (NOT AR Qudrix-owned)
'client_project'
Output: Designed & Developed by AR Vance Agency
        A Digital & Technology Company by AR Qudrix
```

---

## How to Use

### 1. Using the Default Configuration

The system uses **AR Qudrix Product** by default. No changes needed:

```typescript
import CorporateFooter from '@/components/layout/corporate-footer';

export default function Page() {
  return (
    <>
      <main>Your content</main>
      <CorporateFooter />
    </>
  );
}
```

Footer automatically displays:
```
© 2026 Automation Services Platform
A Product by AR Qudrix
Developed by AR Vance Agency
```

### 2. Disabling Branding (Optional)

```bash
# In .env.local
NEXT_PUBLIC_DISABLE_AGENCY_BRANDING=true
```

This removes ALL branding attribution (use sparingly, only if required by client contract).

### 3. Accessing Configuration Programmatically

```typescript
import { getBrandingConfig } from '@/lib/branding/corporate-config';

const config = getBrandingConfig();
console.log(config.productName);      // "Automation Services Platform"
console.log(config.parentCompany);    // "AR Qudrix"
console.log(config.currentYear);      // 2026 (auto-updated each year)
```

---

## Customization

### Changing Product Name

For a different AR Qudrix product, modify the configuration:

```typescript
// lib/branding/corporate-config.ts

export const DEFAULT_AR_QUDRIX_PRODUCT: CorporateBrandingConfig = {
  productName: 'Your Product Name',  // ← Change this
  entityType: 'product',
  // ... rest stays the same
};
```

### Changing Entity Type

For a subsidiary company instead of a product:

```typescript
export const DEFAULT_AR_QUDRIX_PRODUCT: CorporateBrandingConfig = {
  productName: 'Company Name',
  entityType: 'company',  // ← Change to 'company'
  ownershipLabel: 'A Company by',  // ← Update label
  developmentLabel: '',  // ← Remove development label
  // ... rest stays the same
};
```

### Client Project Configuration

For an AR Vance Agency client project (NOT AR Qudrix-owned):

```typescript
import { ARVANCE_CLIENT_PROJECT } from '@/lib/branding/corporate-config';

// Use this instead of DEFAULT_AR_QUDRIX_PRODUCT
export function getBrandingConfig(): CorporateBrandingConfig {
  return {
    ...ARVANCE_CLIENT_PROJECT,
    currentYear: new Date().getFullYear(),
  };
}
```

Output:
```
Designed & Developed by AR Vance Agency
A Digital & Technology Company by AR Qudrix
```

---

## SEO & Metadata

### Automatic Metadata

The system generates SEO metadata automatically:

```typescript
import { getCorprateBrandingMetadata } from '@/lib/branding/metadata';

const metadata = getCorprateBrandingMetadata();

// Generates:
{
  author: "AR Vance Agency - A Digital & Technology Company by AR Qudrix",
  creator: "AR Vance Agency",
  publisher: "AR Qudrix",
  description: "Automation Services Platform - A Product by AR Qudrix"
}
```

### HTML Meta Tags

Add to your `<head>`:

```html
<meta name="author" content="AR Vance Agency - A Digital & Technology Company by AR Qudrix" />
<meta name="creator" content="AR Vance Agency" />
<meta name="publisher" content="AR Qudrix" />
```

### Schema.org JSON-LD

```typescript
import { getCorporateBrandingSchema } from '@/lib/branding/metadata';

const schema = getCorporateBrandingSchema();

// Returns structured data for:
// - Product Name
// - Creator (Parent Company)
// - Author (Developer Company)
// - Publisher (Parent Company)
```

---

## Footer Component Features

### Accessibility ✅

- Keyboard navigable links
- Visible focus states (ring + offset)
- Proper semantic HTML (`<footer>`, `<a>`)
- Screen reader compatible
- Sufficient color contrast

### Responsive Design ✅

- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: 3-column grid
- Proper spacing and padding

### Dark Mode Support ✅

- Optimized for dark backgrounds
- Proper color contrast ratios
- Hover/focus states visible

### Link Security ✅

- Official URLs only:
  - https://arqudrix.com
  - https://arvanceagency.com
- No tracking redirects
- No untrusted domains
- Valid HTTPS links

---

## Validation

The system validates configuration:

```typescript
import { validateBrandingConfig } from '@/lib/branding/corporate-config';

const validation = validateBrandingConfig(config);

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}

// Checks for:
// - Required fields present
// - Valid URLs
// - Valid entity types
// - Proper structure
```

---

## Environment Variables

### Optional Configuration via .env

```
# Disable branding (only if required by client)
NEXT_PUBLIC_DISABLE_AGENCY_BRANDING=false

# Custom branding configuration (advanced)
NEXT_PUBLIC_BRANDING_CONFIG='{"productName":"Custom Name",...}'
```

---

## Important Rules

### ✅ DO

- Use accurate corporate relationships
- Keep attribution professional and minimal
- Maintain links to official domains
- Update year automatically
- Support all entity types correctly
- Make footer accessible

### ❌ DON'T

- Claim AR Qudrix owns client projects
- Use incorrect entity types
- Hard-code product names
- Remove required corporate links
- Create broken attribution links
- Make footer inaccessible
- Use tracking redirects

---

## Testing Branding

### Visual Testing

```bash
npm run dev
# Visit: http://localhost:3000/automation-services
# Scroll to footer
# Verify all links work
# Test keyboard navigation (Tab)
```

### Link Verification

- [ ] "AR Qudrix" link works → https://arqudrix.com
- [ ] "AR Vance Agency" link works → https://arvanceagency.com
- [ ] Both links open in new tab
- [ ] No broken links
- [ ] Proper HTTPS

### Accessibility Testing

- [ ] Tab navigation works
- [ ] Focus visible on all links
- [ ] Screen reader reads properly
- [ ] Sufficient color contrast
- [ ] Responsive on mobile

### Metadata Testing

```bash
# View page source
# Verify <meta> tags present:
# - author
# - creator
# - publisher

# Verify JSON-LD schema:
# <script type="application/ld+json">
```

---

## Future Scalability

This system supports future AR Qudrix products without code changes:

### Example: New Product

```typescript
// Just change the productName
productName: 'Different AR Qudrix Product'
entityType: 'product'
// ... footer automatically updates
```

### Example: AR Qudrix Subsidiary

```typescript
// Change entity type
productName: 'AR Qudrix Subsidiary Name'
entityType: 'company'
ownershipLabel: 'A Company by'
// ... footer automatically updates
```

---

## Support & Questions

- **AR Qudrix:** https://arqudrix.com
- **AR Vance Agency:** https://arvanceagency.com
- **Questions about branding?** Contact AR Qudrix corporate

---

## Compliance Checklist

Before deploying, verify:

- [ ] Entity type is correct (product? company? client project?)
- [ ] Product name is accurate
- [ ] AR Qudrix link works
- [ ] AR Vance Agency link works
- [ ] Footer is accessible
- [ ] Footer is responsive
- [ ] Metadata is generated
- [ ] No hard-coded dates (year is dynamic)
- [ ] No tracking redirects
- [ ] Attribution is honest and accurate

---

**Branding System:** ✅ Complete & Verified

**Last Updated:** 2026

**Version:** 1.0


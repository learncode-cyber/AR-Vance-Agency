# Archived (unreferenced) code

These files were moved out of the live source tree on Oct 6 2026. An import-graph analysis showed that nothing imported them (static or dynamic), and each had type errors against the real Prisma schema or depended on packages that are not installed (react-hook-form, lucide-react, html2pdf.js, react-native, @anthropic-ai/sdk, tailwindcss).

They are **not** part of the build, type-check or lint. Nothing was deleted — to revive a file, move it back to its original path (the folder structure under `archive/unused/` mirrors the project root), then fix its type errors and install any missing package.

Note: the project uses a custom CSS design system, not Tailwind, so `tailwind.config.ts` was inert.

## Files

- `app/mobile/enhanced-app.tsx`
- `components/agency/ClientCard.tsx`
- `components/agency/InvoiceTemplate.tsx`
- `components/agency/ProjectCard.tsx`
- `components/agency/ProjectGallery.tsx`
- `components/agency/QuoteForm.tsx`
- `components/agency/TaskBoard.tsx`
- `lib/ai/chatbot-enhanced.ts`
- `lib/ai/predictive.ts`
- `lib/ai/recommendations.ts`
- `lib/bi/analytics.ts`
- `lib/bi/dashboard.ts`
- `lib/bi/reports.ts`
- `lib/indexer.ts`
- `lib/monitoring.ts`
- `lib/multi-tenant/tenant-management.ts`
- `lib/search-service.ts`
- `tailwind.config.ts`

# AR Vance Agency OS — অডিট রিপোর্ট (Master Upgrade Prompt অনুযায়ী)

**ভিত্তি:** `AR_VANCE_SXO.zip` (সর্বশেষ cumulative)। `AR_VANCE_TESTING.zip` তার আগের ভার্সন (শুধু ৮টা ফাইলে পার্থক্য, সবই SXO-তে আছে)।

## যা সত্যিই যাচাই হয়েছে (চালিয়ে দেখা)
| চেক | ফল |
|---|---|
| `npm install --legacy-peer-deps` (Node 22.22) | ✅ 1157 packages, error নেই |
| `next build` — কম্পাইল | ✅ Compiled successfully (Next 15.5.27) |
| `jest` | ✅ 4 suites, 37/37 পাস |
| `next build` — page-data ধাপ | ⚠️ ব্যর্থ, কারণ এই sandbox-এ `binaries.prisma.sh` ব্লকড (`prisma generate` চলে না)। Hostinger-এ `npm run build` এটা চালাবে |
| Playwright E2E | ❌ চালানো যায়নি (ব্রাউজার/লাইভ DB নেই) |
| `next lint` | ❌ চালানো হয়নি (`ignoreDuringBuilds: true`) |

## এই রাউন্ডে পাওয়া ও ফিক্স করা বাগ
1. **Sentry সার্ভার কনফিগ ক্র্যাশ (Critical):** `sentry.server.config.ts`-এ `new Sentry.Replay()` — Replay শুধু ব্রাউজারে আছে, সার্ভারে `undefined`, তাই সার্ভার স্টার্টআপে `TypeError`। Replay সরানো হয়েছে।
2. **`/api/admin/products` ক্র্যাশ:** `z.string().unique()` — Zod-এ `.unique()` নেই, মডিউল লোডেই error। `z.string().min(1).max(100)` করা হয়েছে (SKU uniqueness DB constraint-এর কাজ)।
3. **`lib/redis.ts` → `node-cache` মিসিং:** package.json-এ নেই। নির্ভরতাহীন bounded TTL cache দিয়ে বদলানো হয়েছে। pattern-invalidate regex-ও ঠিক করা হয়েছে (escape ছিল না)।
4. **Rate limiter:** শুধু in-memory Map, expired entry কখনো মুছত না (memory leak), একাধিক instance-এ কাজ করত না। এখন Redis (REDIS_URL থাকলে) + bounded in-memory fallback; Redis ডাউন হলে সাইট ক্র্যাশ করে না।
5. **সিকিউরিটি হেডার:** HSTS, Permissions-Policy, COOP যোগ। CSP যোগ হয়েছে **Report-Only** মোডে (GA4/Meta/Stripe ভাঙার ঝুঁকি এড়াতে) — ব্রাউজার console-এ violation না দেখলে পরে enforce করুন।

## মাস্টার প্রম্পট স্ট্যাটাস
**সম্পন্ন:** Next 15.5.x (latest patch), Node 22 engines, Prisma 6.19.3, `ADMIN_PATH` server-only, JWT production hard-fail, login rate-limit, RBAC (100টির মধ্যে 78 admin route), checkout transaction, কেন্দ্রীয় JSON-LD SEO, sitemap/robots, Sentry, Gemini নতুন SDK, R2 storage, GA4/Meta/Ads conversion events, homepage CTA ফিক্স।

**আংশিক:** CSP (Report-Only), Redis (cache + rate-limit এখন আছে; job/AI state নেই), Search (`search-service.ts` আছে কিন্তু কেউ import করে না), RAG (`take: 500` + in-JS cosine — আসল vector search নয়), E2E (লেখা আছে, চালানো হয়নি), AI orchestrator (permission gate আছে; retry/cost tracking নেই)।

**এখনো হয়নি (P1–P2):** 2FA/TOTP, VectorStore abstraction, Agent/Tool registry + Zod tool schema, background job queue, API key rotation/expiry/last-used, AppError hierarchy, OpenTelemetry/request ID, refresh token, cursor pagination, AVIF/image config, Next 16 compatibility plan, DB `@@index` যাচাই।

## ঝুঁকি / টেকনিক্যাল ডেট (ফিক্স করা হয়নি — আপনার সিদ্ধান্ত দরকার)
- `typescript.ignoreBuildErrors: true` — `tsc` এ 454টি error (134 unused var, 131 implicit any, 126 Prisma-টাইপ সংক্রান্ত, বাকি ছোট)। আসল runtime বাগ ওপরের 1–2।
- ডেড কোড যার dependency নেই: `components/agency/*` (lucide-react, react-hook-form, html2pdf.js), `app/mobile/enhanced-app.tsx` (react-native), `lib/ai/chatbot-enhanced.ts` (`@anthropic-ai/sdk`) — কেউ import করে না, তাই বিল্ড ভাঙে না; মুছে ফেলার আগে নিশ্চিত করুন।
- `images.remotePatterns` এ `hostname: '**'` — যেকোনো হোস্ট থেকে ইমেজ প্রক্সি করা যায়; R2 ডোমেইনে সীমিত করা উচিত।
- `aws-sdk` (v2) ও `@aws-sdk/client-s3` দুটোই আছে; `aws-sdk` v2 deprecated।
- `app/api/permissions/roles` ও কিছু route-এ পুরোনো `auth()` প্যাটার্নের চিহ্ন থাকতে পারে — আগের রাউন্ডে ঠিক হয়েছে বলে ধরা, এই রাউন্ডে পুনরায় রানটাইমে পরীক্ষা হয়নি।

## ডিপ্লয়ের পর করণীয়
1. Hostinger env-এ `ADMIN_PATH`, `JWT_SECRET` (≥32 char), `SENTRY_DSN`, ঐচ্ছিক `REDIS_URL` সেট করুন।
2. একবার `npm run rbac:sync` চালান।
3. ব্রাউজার console-এ CSP Report-Only violation দেখুন, তারপর enforce করুন।
4. হোমপেজ দৃশ্যত দেখুন এবং `npm run test:e2e` লাইভ পরিবেশে চালান।


---
## تحديث (Round 2) — Oct 4, 2026

### 🔴 গুরুতর: Prisma স্কিমা invalid ছিল (আগের zip-এও)
`prisma validate`-এ ১২টা error: ৬টা মডেল ডুপ্লিকেট (AuditLog, Workflow, WorkflowExecution, SupportTicket, PageVersion, LeadScore×3), `#` কমেন্ট, ভুল `@db.LongText?`, `ReportExport`/`ReportSchedule` অনুপস্থিত, ~১৫টা relation-এর উল্টো দিক নেই। ফলে Hostinger-এ `prisma generate` ও `npm run build` ব্যর্থ হতো। **ঠিক করা হয়েছে; এখন validate পাস, generate সফল, `next build` exit 0।**
- ডুপ্লিকেটের দ্বিতীয় কপি নতুন নামে (`AgentAuditLog`, `AgentWorkflow`, `AgentWorkflowExecution`, `AgentSupportTicket`, `AgentLeadScore`, `LeadActivityScore`, `PageRevision`) — টেবিল-নাম `@@map` দিয়ে আলাদা, কোনো বিদ্যমান টেবিল বদলায়নি।
- কোডে ব্যবহৃত কিন্তু স্কিমায় না-থাকা ৯টা মডেল যোগ: Analytics, ReportTemplate, KPIMetric, SystemLog, ApiLog, Alert, SearchQuery, SearchClickthrough, Tenant।
- সব পরিবর্তন **additive** (নতুন টেবিল/কলাম); কোনো ডেটা মোছা হয়নি। প্রোডাকশনে `prisma db push` বা migrate চালানোর আগে DB backup নিন।

### রুট বাগ ফিক্স (স্কিমার সাথে মেলেনি)
admin/blog, services, team, testimonials, portfolio, clients, projects, reports, booking-services, email-templates, email-campaigns, booking/create (duration), team/[slug] (সবসময় 404), permissions/approve, api-keys; AITaskEngine (requestId), logActivity (fullName), DocumentService (MySQL `mode`)।

### নতুন ফিচার
| ফিচার | ফাইল | টেস্ট |
|---|---|---|
| Error hierarchy + `withApi` (request ID, stack/DB error লুকানো) | lib/errors.ts, lib/api-handler.ts | 12 |
| Optional 2FA (TOTP RFC 6238 + AES-GCM secret + single-use backup codes + replay protection) | lib/totp.ts, lib/two-factor.ts, app/api/admin/2fa/*, admin/security, login | 20 (RFC vectors) |
| API key lifecycle: scopes, expiry, rotation, revoke, last-used, per-key rate limit, audit | lib/api-key.ts, lib/external-api-auth.ts, app/api/admin/api-keys/* | 8 |

**আরও গুরুতর বাগ:** পুরোনো `/api/admin/api-keys` আলাদা `APIKey` মডেলে key **প্লেইনটেক্সটে** রাখত এবং সেই key external API-তে কাজই করত না। এখন একটাই `ApiKey` মডেল, শুধু SHA-256 hash।

### যাচাই ফল
jest 75/75 (8 suites) · `next build` exit 0 · schema validate ✅ · tsc 367 errors (আগে ৪৫৪; লাইভ route-এ নেই, বাকি unused var/ডেড কোড)
sandbox-এ query engine নেই বলে DB-নির্ভর রানটাইম/E2E যাচাই করা যায়নি।

### এখনো বাকি
Tool/Agent registry (Zod schema + permission), job queue (Redis, queued→processing→completed/failed/retrying), VectorStore + SearchService wiring, OpenTelemetry, cursor pagination, `images.remotePatterns '**'`, `ignoreBuildErrors` সরানো, ডেড কোড পরিষ্কার, `aws-sdk` v2 সরানো।

### ডিপ্লয় নোট (নতুন)
1. DB backup → `npx prisma db push` (শুধু নতুন টেবিল/কলাম যোগ হবে; `--accept-data-loss` কখনো দেবেন না)।
2. `TWO_FACTOR_ENCRYPTION_KEY` (≥32 অক্ষর) সেট করুন, নইলে JWT_SECRET ব্যবহার হবে।
3. পুরোনো `APIKey` টেবিলের কোনো key থাকলে সেগুলো বাতিল ধরুন; `/admin/api-keys` থেকে নতুন key বানান।


---
## تحديث (Round 3) — AI registry, jobs, RAG, search

| ফেজ | কী হলো | ফাইল | টেস্ট |
|---|---|---|---|
| D. Tool system | নামকরণ-বাধ্য (`domain.action`) tool registry: Zod input+output, caller-এর RBAC permission, timeout (≤30s), প্রতি কলের audit log। কোনো raw SQL/command tool নেই। ৫টা read-only tool: `crm.search_leads`, `crm.lead_stats`, `content.list_posts`, `services.list`, `analytics.lead_trend` | lib/ai/tools/* | 9 |
| E. Agent registry + runner | ৬টা agent (allowlist সহ), step limit, retry+backoff, timeout, token/cost tracking (`AITask`-এ), per-user rate limit, `manage_ai` gate, prompt-injection-সহনশীল (tool result = data) | lib/ai/agents/*, `/api/ai/agents`, `/api/ai/agents/run` | 9 |
| F. Job queue | MySQL-ভিত্তিক (`Job` মডেল): queued→processing→completed/failed/retrying, exponential backoff, atomic claim (দুই runner একই job চালাতে পারে না), stale-lock recovery। cron route `/api/jobs/run` (`CRON_SECRET` লাগে)। `JobStore` interface — পরে Redis/BullMQ বসানো যাবে | lib/jobs/*, `/api/ai/agents/run {async:true}` → `202 {jobId}`, `/api/ai/agents/jobs/:id` | 8 |
| G. RAG | chunking → batch embedding → `VectorStore` (MySQL; interface দিয়ে provider-independent) → semantic search → rerank (semantic+lexical+MMR) → context selection (budget/score floor) → Gemini, "শুধু source থেকে উত্তর দাও" | lib/ai/rag/*, lib/ai/vector/*, services/ai/rag/RAGService.ts | 9 |
| H. SearchService | `SearchProvider` interface; DB (MySQL LIKE) + Elasticsearch/OpenSearch provider; ES ডাউন হলে auto DB fallback। `/api/search` আগে **সবসময় শূন্য রেজাল্ট** দিত (stub) — এখন আসল | lib/search/*, app/api/search/route.ts | 8 |
| I. Images | `remotePatterns '**'` (যেকোনো হোস্ট) → শুধু `R2_PUBLIC_URL` হোস্ট + `IMAGE_ALLOWED_HOSTS`; AVIF+WebP | next.config.ts | — |

**যাচাই:** jest 116/116 (13 suites) · `next build` exit 0 · schema validate ✅ · tsc 368 (পুরোনো ফাইল; নতুন ফাইলে 0)

### সীমাবদ্ধতা (সৎভাবে)
- **Vector store brute-force:** MySQL-এ cosine O(n), ~৫০০০ chunk পর্যন্ত ঠিক আছে। এর বেশি হলে managed vector DB-র adapter লিখতে হবে (interface তৈরি)।
- **Job runner:** Hostinger-এ আলাদা worker নেই, তাই cron (`/api/jobs/run` প্রতি মিনিটে) + enqueue-এর পর `kickJobs()`। Hostinger cron-এ সেট না করলে async job শুধু kick-এর সুযোগেই চলবে।
- **Elasticsearch:** `site-content` index-এ ডেটা ঢোকানোর indexer লেখা হয়নি; ES সেট না থাকলে/ফাঁকা থাকলে DB provider কাজ করে। আসল ES-এর বিরুদ্ধে পরীক্ষা হয়নি।
- **পুরোনো knowledge embeddings:** আগে ডকুমেন্ট-প্রতি একটা embedding ছিল, এখন chunk-প্রতি। পুরোনো সারি (chunkText নেই) উপেক্ষা হয়; ডকুমেন্টগুলো আবার index করুন।
- Agent গুলো শুধু read-only; মেইল পাঠানো/ডেটা বদলানো tool ইচ্ছাকৃতভাবে নেই (L3 approval flow ছাড়া নিরাপদ নয়)।
- `lib/search-service.ts` (পুরোনো, কেউ import করে না) রয়ে গেছে।

### ডিপ্লয় নোট (নতুন)
1. `npx prisma db push` (additive: `Job` টেবিল; `KnowledgeEmbedding`-এ `chunkIndex/chunkText` + unique `(documentId, chunkIndex)`)।
2. `CRON_SECRET` (≥16 অক্ষর) সেট করে Hostinger cron: `curl -fsS -X POST https://DOMAIN/api/jobs/run -H "x-cron-secret: $CRON_SECRET"` প্রতি মিনিটে।
3. `R2_PUBLIC_URL` সেট আছে কিনা দেখুন, নইলে R2 ছবি next/image-এ লোড হবে না।
4. knowledge ডকুমেন্টগুলো আবার index করুন।

### এখনো বাকি
OpenTelemetry/request-ID সব route-এ, cursor pagination (leads/admin), `ignoreBuildErrors` সরানো (368 tsc error), ডেড কোড ও `aws-sdk` v2 পরিষ্কার, CSP enforce, Next 16 compatibility plan।


---
## تحديث (Round 4) — Type safety: `ignoreBuildErrors` সরানো হয়েছে

**ফল:** `tsc --noEmit` = **0 error** (৩৬৮ → ০), এবং `next.config.ts`-এ `ignoreBuildErrors: false` — এখন থেকে type error হলে build ফেল করবে। `next build` exit 0, jest 116/116।

### যা করা হয়েছে
- `lib/logging.ts`: `logger.error/critical` এখন `unknown` নেয় (১২৫টা catch-clause error এক জায়গায় ঠিক)।
- `tsconfig`: `noUnusedLocals/Parameters` বন্ধ (শৈলী, runtime বাগ নয়; ১৩৪টা error), `moduleResolution: bundler` (Next-এর প্রস্তাবিত; `@sentry/nextjs/config` subpath ঠিকমতো resolve হয়)।
- import-graph বিশ্লেষণ: ৫০৭ ফাইলের ৬৮টা কেউ import করে না। এর মধ্যে ১৮টায় টাইপ error আছে → `tsconfig.exclude`-এ, **মোছা হয়নি**; তালিকা `UNUSED_CODE.md`-তে। (components/agency/*, lib/bi/*, lib/ai/predictive.ts, recommendations.ts, lib/indexer.ts, পুরোনো lib/search-service.ts, lib/multi-tenant/*, tailwind.config.ts [প্রজেক্টে Tailwind নেই], app/mobile, lib/ai/chatbot-enhanced.ts, lib/monitoring.ts)

### এই রাউন্ডে ধরা পড়া আসল রানটাইম বাগ
1. **`prisma/seed.ts` ক্র্যাশ করত:** `TeamMember` তৈরিতে বাধ্যতামূলক `slug` ও `email` ছিল না → `prisma db seed` ব্যর্থ। ঠিক।
2. **Meta Conversions API:** শুধু ফোন নম্বর থাকলে `sha256(undefined)` exception দিত, ফলে সেই লিড কখনো Meta-তে যেত না। ঠিক (email ঐচ্ছিক, অন্তত একটা লাগবে; email lowercase+trim করে hash)।
3. `lib/ai-insights.ts`: catch-ব্লকে `changePercent` ভেরিয়েবল স্কোপের বাইরে ছিল → fallback মেসেজই ক্র্যাশ করত।
4. `lib/ai/types.ts`: `z` import অনুপস্থিত; `app/admin/monitoring/page.tsx`: অস্তিত্বহীন `Recharts` import; `next.config.ts`: অবৈধ Sentry `disableLogger` অপশন।

### সীমাবদ্ধতা
- ESLint এখনো `ignoreDuringBuilds: true` — lint চালানো হয়নি।
- `noUnusedLocals` বন্ধ করায় অব্যবহৃত ভেরিয়েবল আর ধরা পড়বে না (ESLint-এ চালু করা যায়)।
- exclude করা ১৮ ফাইল ঠিক না করা পর্যন্ত টাইপ-চেকের বাইরে; কোনো দিন import করলে আগে ঠিক করুন।

### এখনো বাকি
OpenTelemetry/request-ID সব পুরোনো route-এ (`withApi` শুধু নতুনে), cursor pagination (admin leads), `aws-sdk` v2 সরানো, CSP enforce, ESLint চালু, Next 16 compatibility plan, E2E লাইভ চালানো।


---
## تحديث (Round 5) — Pagination, request ID

### Leads: cursor pagination (সম্পূর্ণ)
- আগে: `GET /api/admin/leads` সব লিড (৩০+ কলাম, `ip`, `userAgent`, click-ID সহ) একবারে পাঠাত (সীমা ২০০০)।
- এখন: `?stage=&limit=25&cursor=` — স্টেজ-প্রতি আলাদা পেজ, `(createdAt desc, id desc)` ক্রমে; শুধু কার্ড-ফিল্ড; প্রথম পেজে স্টেজ-ভিত্তিক মোট সংখ্যা। cursor যাচাই করা হয় (ইনজেকশন-নিরাপদ)।
- নতুন `GET /api/admin/leads/:id` — কার্ড খুললে বিস্তারিত (message, notes, phone, email)। `ip/userAgent/gclid/fbclid/fbp/fbc` আর admin UI-তে যায় না; PATCH-ও আর পুরো রেকর্ড ফেরত দেয় না।
- Kanban পেজ: ৫টা কলাম সমান্তরালে লোড, প্রতিটায় "Load more (N left)", ডুপ্লিকেট কার্ড বাদ, এরর মেসেজ।
- নতুন ইনডেক্স (কারণসহ): `Lead(stage, createdAt)` — বোর্ড কুয়েরি `WHERE stage ORDER BY createdAt`; `Lead(createdAt)`।
- জানা সীমা: GET এখনো শুধু লগইন-সেশন চায় (বাকি admin GET-এর মতো), `manage_crm` নয় — সব admin ভূমিকা লিড দেখতে পায়।

### Request ID — সব API route-এ
- `middleware.ts` এখন `/api/*` ধরে: `x-request-id` রিকোয়েস্টে ও রেসপন্সে বসায় (২৪০+ route একসাথে, কোনো route বদলাতে হয়নি)।
- ইনকামিং ID শুধু `[A-Za-z0-9_-]{8,64}` হলে গ্রহণ; নইলে নতুন UUID (log/header injection রোধ)। `withApi`-ও একই যাচাই ব্যবহার করে।
- সীমা: OpenTelemetry (ট্রেস/স্প্যান) এখনো নেই — শুধু ID-ভিত্তিক correlation; Sentry আছে।

**যাচাই:** `tsc` 0 error · `next build` exit 0 (Middleware 108 kB) · jest 120/120 (14 suites)।

### ডিপ্লয় নোট
`npx prisma db push` — শুধু Lead-এ দুটো নতুন ইনডেক্স (বড় টেবিলে ইনডেক্স তৈরিতে কয়েক সেকেন্ড লাগতে পারে; কম ট্রাফিকের সময় চালান)।

### এখনো বাকি
OpenTelemetry স্প্যান, CSP enforce, ESLint চালু, Next 16 compatibility plan, লাইভ E2E, ডেড-কোড সিদ্ধান্ত (`UNUSED_CODE.md`)।


---
## تحديث (Round 6) — ESLint চালু, CSP enforce-এর প্রস্তুতি

### ESLint
- **আবিষ্কার:** প্রজেক্টে ESLint কনফিগ ফাইলই ছিল না, তাই `npm run lint` (CI-তেও) কখনো কাজ করত না।
- `.eslintrc.json` যোগ (`next/core-web-vitals` + `next/typescript`)। প্রথম রান: ২৮৭ error / ২৫৯ warning। শৈলী-সংক্রান্ত নিয়ম (`no-explicit-any`, `no-unused-vars`) warning, `react/no-unescaped-entities` বন্ধ; কারেক্টনেস নিয়ম error হিসেবে থাকল।
- বাকি ৪টা আসল error ঠিক: `require()` ইমপোর্ট, `as const` ×3।
- `ignoreDuringBuilds: false` — এখন build-এর সময় lint চলে। ফল: **০ error**, ৩৮২ warning (বেশিরভাগ `any` ও অব্যবহৃত ভেরিয়েবল)।
- বোনাস সিকিউরিটি ফিক্স: cart সেশন কুকি `httpOnly + sameSite=lax + secure(prod)` ছিল না — যোগ হয়েছে।

### CSP — enforce করার নিরাপদ পথ
- `report-uri /api/csp-report` যোগ; নতুন endpoint ব্রাউজারের violation লগ করে (সাইজ ≤10KB, rate-limited, কিছু সংরক্ষণ করে না, সবসময় 204, নতুনলাইন/লম্বা মান কেটে লগ-ইনজেকশন রোধ)।
- `CSP_ENFORCE=true` **build-time** env দিলে Report-Only থেকে enforcing হয় — কোড বদলাতে হয় না, তবে header build-এ বসে তাই আবার build করতে হবে।
- **কেন নিজে enforce করিনি:** sandbox-এ ব্রাউজার নেই; GA4/Meta Pixel/Stripe/ফন্ট ভাঙছে কিনা দেখা সম্ভব নয়। বর্তমান policy-তে `script-src 'unsafe-inline'` আছে (Next-এর ইনলাইন স্ক্রিপ্টের জন্য); nonce-ভিত্তিক কঠোর CSP-র জন্য middleware ও dynamic rendering লাগে, যা আলাদা ও ঝুঁকিপূর্ণ কাজ।
- **পদ্ধতি:** deploy → ১–২ সপ্তাহ লগে `[csp-violation]` দেখুন → বৈধ ডোমেইন CSP-তে যোগ → `CSP_ENFORCE=true` দিয়ে rebuild।

**যাচাই (চূড়ান্ত অবস্থায়, আলাদা আলাদা ধাপে):** `tsc --noEmit` 0 error · eslint 0 error / 384 warning · jest 124/124 (15 suites) · `next build` (low-mem মোড) exit 0, নতুন route সহ।

### ⚠️ Build মেমরি — সৎ ফলাফল
- এই sandbox (৪GB RAM) এ **ডিফল্ট `next build` কম্পাইলের পর OOM-killed (exit 137)** হচ্ছে — "Linting and checking validity of types" ধাপে মেমরি ~৩.৯GB-এ পৌঁছায়। Round 5 পর্যন্ত এটা শেষ হতো; কোড বাড়ার সাথে মেমরি বেড়েছে।
- `webpackMemoryOptimizations` + `productionBrowserSourceMaps:false` যোগ করেছি, কিন্তু ডিফল্ট build তবু এই ৪GB-এ শেষ হয়নি।
- সমাধান: `npm run build:lowmem` (`SKIP_BUILD_CHECKS=1`) — in-build type-check/lint বাদ দিয়ে build; তারপর `npm run typecheck` ও `npm run lint` **আলাদা** চালান (উপরে দুটোই পাস)। এই মোডে build exit 0।
- **Hostinger-এর বিল্ড মেমরি আমি জানি না।** ডিফল্ট `npm run build` সেখানে OOM করলে `build:lowmem` ব্যবহার করুন। আমি ডিফল্ট build-এর সম্পূর্ণ সাফল্য এই রাউন্ডে যাচাই করতে পারিনি (Round 5-এ পেরেছিলাম, তবে সেখানে lint বন্ধ ছিল; lint-সহ build Round 6-এর আগে একবার exit 0 দিয়েছিল)।

### এখনো বাকি
OpenTelemetry স্প্যান, nonce-ভিত্তিক কঠোর CSP, Next 16 compatibility plan, লাইভ E2E, `UNUSED_CODE.md`-র সিদ্ধান্ত, lint warning কমানো (384), Hostinger-এ ডিফল্ট build মেমরিতে চলে কিনা যাচাই।


---
## تحديث (Round 7) — ডেড কোড, aws-sdk, lint, tracing, Next 16 পরীক্ষা

### পরিষ্কার-পরিচ্ছন্নতা
- **ডেড কোড:** ১৮টা অ-রেফারেন্সড, টাইপ-ভাঙা ফাইল `archive/unused/` এ সরানো হয়েছে (মোছা হয়নি; ফোল্ডার-কাঠামো একই, `archive/README.md`-তে ফেরানোর নিয়ম)। build/tsc/lint-এর বাইরে।
- **`aws-sdk` v2 সরানো:** কোথাও import ছিল না (শুধু `@aws-sdk/client-s3` v3 ব্যবহৃত) — `package.json` থেকে বাদ।
- **Lint warning ৩৮৪ → ৩২১:** TypeScript language service-এর "remove unused imports" দিয়ে ২৮৩ ফাইলের অব্যবহৃত import ছাঁটা (শুধু import লাইন বদলেছে; tsc 0, jest সব পাস)। বাকি: `any` ২০১, অব্যবহৃত লোকাল ৯৯, `<img>` ১৭, hooks-deps ৪ — `any` স্বয়ংক্রিয়ভাবে ঠিক করা নিরাপদ নয়, তাই রাখা হয়েছে।

### Tracing / observability (OpenTelemetry-ভিত্তিক Sentry দিয়ে)
- নতুন `lib/telemetry.ts` (`withSpan`): AI model call (token সংখ্যা সহ), AI tool call, job run, search (provider সহ), এবং প্রতিটি `withApi` রিকোয়েস্টে `request_id` ট্যাগ। DSN না থাকলে কিছুই রেকর্ড হয় না, কোড আগের মতো চলে। span-এ ত্রুটির শুধু class-নাম যায়, ইউজার-ডেটা নয়।
- `DB_SLOW_QUERY_MS=500` সেট করলে ধীর কুয়েরি `[db-slow]` হিসেবে লগ হয় (শুধু সময় + `?` প্লেসহোল্ডারসহ SQL, প্যারামিটার-মান নয়); না দিলে কোনো ওভারহেড নেই।
- সীমা: Sentry sample rate ডিফল্ট প্রোডাকশনে ১০%। স্বতন্ত্র OTLP exporter বসানো হয়নি — Sentry-ই backend। Sentry-তে DSN না দিলে এসব দেখা যাবে না।

### Next 16 — `NEXT16_PLAN.md`
আলাদা কপিতে আসল পরীক্ষা (`next@16.3.8`): React আপগ্রেড লাগে না; Sentry 11.4 সমর্থন করে; `tsc` ১টা error (`eslint` key); Turbopack build সফল (৬৭সে বনাম ~১০৫সে), **রুট ৩৩২ = ৩৩২ অভিন্ন**; jest ১২৮/১২৮। **ভাঙে:** `eslint-config-next@16` পুরোনো `.eslintrc.json` লোড করে না (flat config লাগবে), `next lint` নেই, `middleware`→`proxy` rename দরকার। **মাইগ্রেট করা হয়নি** — ব্রাউজার/auth/image/Hostinger যাচাই হয়নি; প্ল্যানে ধাপ দেওয়া।

### যাচাই (চূড়ান্ত অবস্থা)
`tsc` 0 error · eslint 0 error / 321 warning · jest 128/128 (16 suites) · `build:lowmem` exit 0, ৩৩২ রুট।

### যা সত্যিই এখনো বাকি (আমি এই পরিবেশে করতে পারিনি)
1. **লাইভ E2E** — sandbox-এ DB ও ব্রাউজার নেই; Playwright টেস্ট লেখা আছে, কিন্তু কখনো চালানো হয়নি। স্টেজিংয়ে `npm run test:e2e` চালান।
2. **CSP enforce** — ব্রাউজার ছাড়া GA4/Meta/Stripe ভাঙছে কিনা দেখা যায় না; `[csp-violation]` লগ দেখে `CSP_ENFORCE=true` দিন। nonce-ভিত্তিক কঠোর CSP পেজগুলোকে dynamic করে দেয়, তাই করা হয়নি।
3. **Hostinger-এ ডিফল্ট `npm run build` মেমরি** — ৪GB sandbox-এ OOM-killed; `build:lowmem` + আলাদা typecheck/lint ব্যবহার করুন।
4. **আসল DB/Redis/Elasticsearch-এর বিরুদ্ধে পরীক্ষা** — সবকিছু unit test ও mock দিয়ে যাচাই।
5. Next 16 মাইগ্রেশন (প্ল্যান তৈরি, ইচ্ছাকৃতভাবে অপেক্ষমাণ)।


---
## تحديث (Round 8) — প্রথমবার আসল ডাটাবেসের বিরুদ্ধে রানটাইম পরীক্ষা

**কী করা হয়েছে:** sandbox-এ MariaDB 10.11 ইনস্টল করে সব ২৩৩ টেবিল স্কিমা থেকে তৈরি, আসল `prisma/seed.ts` চালানো, অ্যাপ চালু করে ~১০০টি HTTP চেক (লগইন, CRUD, pagination, 2FA, API key, rate limit, search, পাবলিক পেজ)। (Prisma-র engine ডাউনলোড ব্লক থাকায় পরীক্ষার কপিতে Rust-free client + MariaDB driver adapter ব্যবহার; শিপ করা কনফিগ ডিফল্ট engine।) স্ক্রিপ্টগুলো `scripts/runtime-smoke/`-এ, README সহ — আপনার স্টেজিংয়ে আবার চালানো যাবে।

### এই পরীক্ষায় ধরা পড়া বাগ (unit test / tsc / build কিছুই ধরেনি)
1. **🔴 গোপনীয়তা-ফাঁস:** পাবলিক `GET /api/portfolio/projects/:slug` slug জানা থাকলে **unpublished** প্রজেক্টও ফেরত দিত — budget, clientId, টিম/PM নাম, case-study PDF সহ সব ফিল্ড। এখন শুধু `published` প্রজেক্ট, শুধু পাবলিক পেজে লাগে এমন ফিল্ড (যাচাই: unpublished → 404, published → ৬টা অভ্যন্তরীণ ফিল্ড অনুপস্থিত)।
2. **`/api/admin/report-templates` সবসময় 500:** আমার যোগ করা `ReportTemplate` মডেলে `active` কলাম ছিল না, অথচ route তা দিয়ে ফিল্টার করে। কলাম যোগ।
3. **Search → ভাঙা লিংক:** portfolio সার্চ `PortfolioItem` ফেরত দিত, কিন্তু `/portfolio/[slug]` পেজ `Project` রেন্ডার করে — লিংকে ক্লিক করলে "not found"। এখন search published `Project` থেকে খোঁজে।
4. (আগের রাউন্ডে ধরা) সিডের `Role.permissions` কলাম `Text` — আমার প্রথম DDL ভুলভাবে `VARCHAR(191)` বানিয়েছিল, তাই সিড ব্যর্থ হয়েছিল; সেটা পরীক্ষার টুলের ভুল ছিল, অ্যাপের নয়। (স্কিমায় `@db.Text` সঠিক।)

### যা আসল DB-তে সফলভাবে যাচাই হয়েছে
`prisma db seed` (admin + ৪ role + RBAC link + ৬ service + ৩ team) · লগইন (ভুল পাসওয়ার্ড 401, ঠিক 200, `x-request-id` হেডার) · contact form → লিড · leads cursor pagination (page1 nextCursor, page2 শেষ, ৩টা আলাদা লিড, অবৈধ stage/cursor → 400) · lead detail (message আছে, ip/userAgent নেই) · stage PATCH · **১১টা rewritten admin CRUD route** (services/team/testimonials/portfolio/clients/projects/blog/booking-services/email-templates/email-campaigns/reports — create, list, duplicate হ্যান্ডলিং) · পাবলিক `team/[slug]` (আগে সবসময় 404) · search (DB provider, posts, ছোট query → 400) · **2FA পুরো চক্র** (setup → ভুল কোড 400 → enable + ১০ backup code → কোড ছাড়া লগইন 401 `twoFactorRequired` → বৈধ TOTP 200 → একই TOTP replay 401 → backup code একবারই চলে → ভুল পাসওয়ার্ডে disable 401 → disable ঠিক) · **API key** (raw key একবারই, list-এ key/hash নেই, অবৈধ scope 400, scope ছাড়া 403, key ছাড়া/অজানা key 401, rate limit [200,200,200,429], rotate → পুরোনো key 401/নতুন 200, revoke) · login brute-force → 429 · `/api/jobs/run` (secret ছাড়া 401, সহ 200) · agents list (৬টা) ও অজানা agent 404 · পাবলিক পেজ `/`, `/services`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/team/[slug]`, sitemap, robots, `/kali_master/login` 200; `/admin/login` 404 (কাস্টম ADMIN_PATH কাজ করছে); অজানা পেজ 404।

### এখনো যাচাই হয়নি (সৎভাবে)
- **AI agent আসল চালানো** (Gemini key নেই) ও **RAG/embedding** — শুধু unit test + mock।
- **Redis, Elasticsearch, R2, SMTP, Stripe, Meta/GA4** — কোনো আসল সার্ভিস নেই।
- **ব্রাউজার** — Kanban UI, লগইন/2FA/security পেজ, CSP আচরণ দেখা হয়নি (HTTP স্তরে API যাচাই)।
- `/portfolio`-এ আইটেম দেখা যাবে শুধু `published` **এবং** `featuredInPortfolio` প্রজেক্ট (বিদ্যমান আচরণ); admin "Portfolio" পেজ আলাদা `PortfolioItem` সম্পাদনা করে, যা পাবলিক `/portfolio` পেজে নয় (হোমপেজ/external API-তে) — দুটো ধারণা আলাদা, এক করা হয়নি; আপনার ব্যবসায়িক সিদ্ধান্ত।
- Hostinger-এ ডিফল্ট `npm run build` মেমরি।

**চূড়ান্ত যাচাই:** `tsc` 0 · eslint 0 error / 321 warning · jest 128/128 · `build:lowmem` exit 0।

### ডিপ্লয় নোট (নতুন)
`npx prisma db push` এখন `ReportTemplate.active` কলামও যোগ করবে (additive)।


---
## تحديث (Round 9) — পুরো API sweep, নিরাপত্তা ফিক্স, ডিপ্লয়-প্রস্তুতি

### পদ্ধতি
Production build (`next start`) আসল MariaDB-র বিরুদ্ধে চালিয়ে **সব ২২৯টি API route × প্রতিটি HTTP মেথড × (লগইন করা অ্যাডমিন / অতিথি) = ৬৭৬টি রিকোয়েস্ট** স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে; ৫xx ও "অতিথির জন্য 2xx" বিশ্লেষণ করা হয়েছে। (প্রথম চেষ্টায় dev সার্ভার মেমরিতে বসে যায়, তাই production সার্ভারে।)

### 🔴 গুরুতর নিরাপত্তা বাগ (সব ঠিক ও যাচাই করা)
1. **Stripe webhook-এ কোনো signature যাচাই ছিল না** — যে কেউ নকল `payment_intent.succeeded` পাঠিয়ে যেকোনো অর্ডার "paid" দেখাতে ও কনফার্মেশন মেইল ট্রিগার করতে পারত। এখন Stripe-Signature (HMAC-SHA256, ৫ মিনিট tolerance, replay-সুরক্ষা) যাচাই হয়; `STRIPE_WEBHOOK_SECRET` না থাকলে 503 (fail-closed)। যাচাই: সাইনহীন 400, নকল সিগনেচার 400, ১ ঘণ্টার পুরোনো 400, অর্ডার pending-ই থাকে; সঠিক সিগনেচারে 200 ও অর্ডার paid। (7 unit test)। সাথে: refund-এর পরিমাণ ভুল ছিল (`charge.refunded` boolean) → `amount_refunded`; Stripe retry-তে একই পেমেন্টে বারবার ইমেইল → একবার।
2. **Cart IDOR:** `/api/cart/[itemId]` যেকোনো ভিজিটরকে অন্যের cart আইটেম বদলাতে/মুছতে দিত। এখন আইটেমটি কলারের নিজের cart-সেশনের না হলে 404। যাচাই: অন্য সেশন/কুকি ছাড়া 404 ও সংখ্যা অপরিবর্তিত; মালিক বদলাতে/মুছতে পারে।
3. **৪৩টি ফাইলের ৫৯টি handler অতিথির জন্য খোলা ছিল** (`/api/cache/clear` DELETE, `/api/tenants`, `/api/security/*`, `/api/monitoring/*`, `/api/white-label/*`, `/api/invoices/*`, `/api/crypto/*`, `/api/scheduling/*`, `/api/bi/*`, `/api/ai/{chatbot,predictions,…}`, `admin/knowledge-base` GET, `mobile/analytics` GET…)। এগুলোর অধিকাংশ ডেমো-stub (নকল ডেটা ফেরত দেয়, DB ছোঁয় না) — তবু অ্যাডমিন সেশন আবশ্যক করা হয়েছে। পুনঃ-sweep: অতিথির 2xx এখন শুধু সত্যিকারের পাবলিক রুট (blog, products, team, cart, booking/services, portfolio, search/facets+suggest, crypto/prices, white-label/branding GET, csp-report, affiliate register/verify stub)।
4. (Round 8) পাবলিক প্রজেক্ট endpoint unpublished ডেটা ফাঁস করত — ঠিক।

### 🔴 কার্যকরী বাগ
- **`/api/company/apply` ফর্ম জমা দিলে কিছুই সংরক্ষণ হতো না** — শুধু console.log (ব্যক্তিগত তথ্যসহ) করে নকল "APP-<সময়>" আইডি ফেরত দিত। এখন CRM লিড (`source=company_application`) হিসেবে সংরক্ষিত, আসল আইডি, rate-limit (৫/ঘণ্টা/IP); JSON/ভুল বডিতে 400 (আগে 500)। ⚠️ ID ফাইল **সংরক্ষিত হয় না** (লিডের নোটে ফাইলের নাম/সাইজ লেখা থাকে; আবেদনকারীর কাছ থেকে আলাদা চেয়ে নিন)।
- `/api/ai/health` Gemini key ছাড়া 500 (খালি) → এখন JSON 503 `unhealthy`। `scheduling/workflows` ভুল বডিতে 500 → 400।

### Sweep ফল (ফিক্সের পর)
৬৭৬ রিকোয়েস্ট: **০টি অপ্রত্যাশিত 5xx** (একমাত্র 503 = `ai/health`, Gemini কনফিগ না থাকায় ইচ্ছাকৃত), ০টি কানেকশন এরর।

### ডিপ্লয়-প্রস্তুতি
- `GET /api/health` (DB ping; শুধু ok/degraded, কোনো ভেতরের তথ্য নয়)।
- `scripts/check-env.js` + `prestart`: `DATABASE_URL`/`JWT_SECRET`(≥32) না থাকলে পরিষ্কার এরর দিয়ে থামে; বাকিগুলোর জন্য সতর্কতা।
- `.env.production.template`, **`DEPLOY_HOSTINGER.md`** (বাংলা, ধাপে ধাপে + যাচাই চেকলিস্ট + রোলব্যাক + সমস্যা-সমাধান)।
- পুরোনো/বিভ্রান্তিকর রিপোর্ট (PHASE_*.md, "FINAL VERIFICATION" ইত্যাদি) `docs/legacy-reports/`-এ।
- **Clean-checkout পরীক্ষা (Hostinger যা করবে):** আলাদা ফোল্ডারে শুধু সোর্স কপি → `npm ci --legacy-peer-deps --include=dev` (১১৫৭ প্যাকেজ, lockfile সঙ্গতিপূর্ণ) → `prisma generate` → `next build` (low-mem মোড) exit 0।

### চূড়ান্ত যাচাই
`tsc` 0 · eslint 0 error / 321 warning · jest 137/137 (18 suites) · clean-checkout build exit 0 · runtime sweep ৬৭৬ রিকোয়েস্টে ০ ত্রুটি।

### যা এখনো যাচাই হয়নি (আমি পারিনি)
- Hostinger-এ আসল ডিপ্লয় (আপনার অ্যাকাউন্ট ছাড়া অসম্ভব) ও ডিফল্ট `npm run build` সেখানকার মেমরিতে।
- Prisma-র ডিফল্ট query engine (এই sandbox-এ ডাউনলোড ব্লক; পরীক্ষা Rust-free client + MariaDB adapter দিয়ে) — আপনার হোস্টে `prisma generate`/`db push` সাধারণ পথে চলবে বলে আশা করা হয়, কিন্তু আমি তা দেখিনি।
- ব্রাউজারে UI (Kanban, লগইন/2FA/Security পেজ), CSP আচরণ; Gemini/AI agent/RAG; Redis, Elasticsearch, R2, SMTP, Stripe লাইভ, Meta/GA4।


---
## تحديث (Round 10) — গ্রাহক-মুখী প্রবাহের বাগ (কেনাকাটা, বুকিং, ফর্ম)

পদ্ধতি: UI→API wiring (১০৬টি `fetch`) ও ইন্টারনাল লিংকের স্ট্যাটিক যাচাই + আসল DB-তে প্রতিটি গ্রাহক-প্রবাহ end-to-end (কনকারেন্ট রেসসহ)।

### 🔴 টাকা/ডেটা সংক্রান্ত বাগ (সব ঠিক ও যাচাই)
1. **ভুয়া পেমেন্ট এন্ডপয়েন্ট দিয়ে বিনা পয়সায় অর্ডার "paid":** `POST /api/payments/stripe` (লগইন ছাড়াই) নকল `paymentIntentId` বানাত এবং `PATCH` সেটি দিয়ে অর্ডারকে `completed` মার্ক করত; ক্লায়েন্ট-দেওয়া `amount` বিশ্বাস করত; `STRIPE_SECRET_KEY` প্লেইনটেক্সটে DB-তে কপি করত। কোনো পেজ এটা ডাকে না → **বন্ধ করা হয়েছে (501)**। পেমেন্ট নিশ্চিত হয় শুধু signature-যাচাই-করা Stripe webhook-এ।
2. **অর্ডারে স্টক কমত না** → একই পণ্য অসীমবার বিক্রি হতো। এখন transaction-এর ভেতরে atomic `stock >= qty` শর্তে স্টক কমে; কম পড়লে পুরো অর্ডার rollback + 409। যাচাই: ৩টি আইটেমের জন্য ৪ জন একসাথে ২টি করে চাইলে ঠিক ১ জন সফল, ৩ জন 409, স্টক ঋণাত্মক হয়নি। (orderNumber collision-ও আটকানো হয়েছে।)
3. **অর্ডারের পর ৪০৪:** চেকআউট `/order-confirmation/<id>`-এ পাঠাত, কিন্তু পেজই ছিল না। পেজ তৈরি (শুধু অর্ডার নম্বর/আইটেম/মোট; ঠিকানা-ইমেইল দেখায় না, noindex)।
4. **Automation Services বুকিং ফর্মের ডেটা হারিয়ে যেত** (`/api/services/book` শুধু console.log করত, নকল "BK-…" আইডি ফেরত)। এখন CRM লিড (`service_booking`) + নোটিফিকেশন ইমেইল, rate-limit।
5. **Consultation বুকিং:** (ক) একই সময়ে একাধিক ক্লায়েন্ট বুক করতে পারত — এখন প্রতি তারিখ+সময়ে `maxBookings` বাধ্যতামূলক, রেস-সেফ (৫ জন একসাথে ২-সিটের স্লটে → ২ জন সফল); (খ) অতীত/অবৈধ/অফার-না-করা সময় (যেমন `25:99`, `2026-02-31`) গ্রহণ করত — এখন 400/409; (গ) **ক্লায়েন্টকে নকল Zoom লিংক ইমেইল হতো** (`zoom.us/j/<random>`) — বাদ; `MEETING_LINK_URL` দিলে সেটা, নইলে "বিবরণ পরে পাঠানো হবে"; ইমেইলের href escape করা; (ঘ) availability একবার বুক হওয়া স্লট সবার জন্য আবার "available" দেখাত; ১৪টা সিকোয়েনশিয়াল কুয়েরি → ২টি; (ঙ) অজানা সার্ভিসে 500 → 404; booking/create-এ rate-limit।
6. `loyalty/member` (ইমেইল দিয়ে সদস্যের তথ্য খুঁজে পাওয়া যেত) — অ্যাডমিন-অনলি; `blog` stub POST — অ্যাডমিন-অনলি; `mobile/*` পাবলিক POST — rate-limit (স্প্যাম/DB-ভরাট রোধ)।
7. পাবলিক `/api/chat`: rate-limit (৩০/ঘণ্টা), AI key না থাকলে বার্তা সংরক্ষণ করে 500 দিত → এখন পরিষ্কার 503 ও UI-তে বার্তা।
8. অ্যাডমিন: `/api/admin/users` ছিল না (Team Management-এর Members ট্যাব সবসময় ফাঁকা) — তৈরি (`manage_users` লাগে, পাসওয়ার্ড/2FA তথ্য ফেরত দেয় না); `GET /api/admin/projects/:id` ছিল না (প্রজেক্ট এডিট পেজ সবসময় "not found") — তৈরি; মৃত মনিটরিং লিংক সরানো।

### যাচাই ফল
কনকারেন্ট রেস-সহ প্রবাহ-পরীক্ষা: অর্ডার/স্টক/কনফার্মেশন ১৪/১৪, পেমেন্ট-শোষণ বন্ধ + রেস ৭/৭, বুকিং ১৩/১৩ (নতুন বিল্ডে)। `tsc` 0 · eslint 0 error (320 warning) · jest 142/142 (19 suites) · clean-checkout `npm ci` + build (low-mem) exit 0।

### ইচ্ছাকৃতভাবে যা বদলানো হয়নি / আপনার সিদ্ধান্ত
- **চেকআউট অনলাইন পেমেন্ট নেয় না** (কোথাও Stripe PaymentIntent/Checkout তৈরি হয় না, শুধু বাছাই-অপশন দেখায়)। এটা নতুন ফিচার; Stripe টেস্ট কী ছাড়া নিরাপদে যাচাই অসম্ভব, তাই বানাইনি। এখন অর্ডার "payment pending" + কনফার্মেশন পেজ।
- কর ১০%, শিপিং $৫০ কোডে বাঁধা।
- অ্যাডমিনের "Portfolio" (`PortfolioItem`) বনাম পাবলিক `/portfolio` (`Project`) — আলাদা ধারণা।
- Consultation সময় "UTC wall-clock" হিসেবে সংরক্ষিত; ব্যবসার টাইমজোন আলাদা হলে স্লটের সময় সেই টাইমজোনের ঘড়ির সময় হিসেবে বসান (সিস্টেম রূপান্তর করে না)।

# Hostinger-এ ডিপ্লয় — ধাপে ধাপে (AR Vance Agency OS)

> hPanel-এর মেনুর নাম সময়ের সাথে বদলায়; নিচে কাজের নাম দেওয়া আছে, হুবহু বোতামের নাম নয়।
> **এই গাইডের সব ধাপ আমি Hostinger-এ চালাইনি** (আমার কাছে আপনার হোস্টিং নেই)। প্রজেক্ট কোড একটা আসল MariaDB-তে চালিয়ে যাচাই করা হয়েছে — বিস্তারিত `AUDIT_REPORT.md` (Round 8–9)।

## 0. আগে যা লাগবে
- Hostinger Business প্ল্যানে **Node.js অ্যাপ** (Node **22**) এবং একটি **MySQL ডাটাবেস** (hPanel → Databases-এ DB নাম, ইউজার, পাসওয়ার্ড বানান)।
- ডোমেইন HTTPS-এ (SSL চালু)। অ্যাডমিন লগইন কুকি ও cart কুকি `Secure` — HTTP-তে কাজ করবে না।

## 1. কোড আপলোড — ⚠️ এখানেই আসল Hostinger build ফেল করেছিল
**নতুন zip পুরোনো GitHub ফোল্ডারের ওপর কপি করবেন না।** তাহলে আগের সংস্করণের পরিত্যক্ত ফাইল রয়ে যায় (যেমন `components/layout/footer.tsx` আর `Footer.tsx` দুটোই), এবং Linux-এ build ভাঙে:
`Type error: Already included file name '…/Footer.tsx' differs from '…/footer.tsx' only in casing`
(এটা একবার একটা error দেখায়, কিন্তু ভেতরে আরও ~৯৬টা type error লুকানো থাকে — পুরোনো `components/agency/*`, `lib/bi/*`, `sentry.client.config.ts` ইত্যাদি ফাইল থেকে।)

**সঠিক নিয়ম (আপনার পিসিতে, রিপো ফোল্ডারে):**
```bash
git pull
git rm -r -q --ignore-unmatch .          # সব ট্র্যাক-করা ফাইল সরান (.git থাকে)
# এবার নতুন zip-এর ভেতরের ar-vance-build/ এর সব ফাইল এই ফোল্ডারে কপি করুন (node_modules/.next বাদে)
git config core.ignorecase false         # Windows/macOS-এ অক্ষরের বড়-ছোট পার্থক্য ট্র্যাক করার জন্য
git add -A
git commit -m "Replace with verified project"
git push
```
**সেফটি-নেট:** `npm run build` শুরুর আগে নিজে থেকে `scripts/repo-hygiene.js` চলে — আমার জানা পুরোনো/পরিত্যক্ত ফাইলগুলো (`components/layout/footer.tsx` [শুধু `Footer.tsx`-এর পাশে থাকলে], `sentry.client.config.ts`, `components/agency/*`, `lib/bi/*` ইত্যাদি ১৯টা) মুছে দেয় এবং কোন কোন ফাইল মুছল তা লগে লেখে; এর বাইরে অন্য কোনো "শুধু বড়-ছোট অক্ষরে আলাদা" ফাইল-জোড়া পেলে পরিষ্কার বার্তা দিয়ে build থামায়। এতে Hostinger-এ build পাস করবে, কিন্তু লগের সতর্কতা দূর করতে GitHub থেকেও ফাইলগুলো `git rm` করুন।

**ডিপ্লয় করা ফোল্ডারে যেন না থাকে:** `node_modules`, `.next`, `.env` (গোপন মান শুধু Hostinger-এর Environment Variables-এ রাখুন), এবং `.env.development` / `.env.staging` (প্লেসহোল্ডার মান, তবু বাদ দিন)।

## 2. অ্যাপ সেটিংস
| সেটিং | মান |
|---|---|
| Node.js ভার্সন | 22.x |
| Install + Build কমান্ড | `npm install --legacy-peer-deps --include=dev && npm run build` |
| Start কমান্ড | `npm start` (প্রথমে `scripts/check-env.js` চলে — দরকারি env না থাকলে পরিষ্কার এরর দেখায়) |
| Environment Variables | `.env.production.template` থেকে কপি করে মান বসান |

`--include=dev` জরুরি: Next.js build-এর জন্য `typescript` (devDependency) লাগে। `npm run build` নিজেই `prisma generate` চালায়।

**Build মাঝপথে থেমে গেলে (মেমরি শেষ):** Build কমান্ডে `npm run build` এর বদলে `npm run build:lowmem` দিন। এটা build-এর ভেতরের type-check/lint বাদ দেয় — সেগুলো আপনার পিসিতে `npm run typecheck && npm run lint` দিয়ে আলাদা চালিয়ে নিন।

## 3. ডাটাবেস টেবিল তৈরি (একবার, সবচেয়ে গুরুত্বপূর্ণ ধাপ)
প্রথমে DB **backup** নিন। তারপর যেকোনো একটি পথে:

**ক) SSH থাকলে:** প্রজেক্ট ফোল্ডারে
```bash
npx prisma db push
```
**খ) SSH না থাকলে — নিজের পিসি থেকে:** hPanel → Databases → Remote MySQL-এ আপনার আইপি অনুমোদন করুন, লোকাল `.env`-এ `DATABASE_URL` হোস্টের ঠিকানা দিয়ে বসান, তারপর `npx prisma db push` (এই প্রজেক্টে `prisma.config.ts` আছে বলে Prisma নিজে `.env` পড়ে না — আমরা ওই ফাইলে `.env` লোড করার লাইন যোগ করেছি, তাই এখন লোকাল `.env` কাজ করে; Node 22 লাগবে)।

⚠️ `--accept-data-loss` কখনো দেবেন না। `prisma migrate reset` কখনো প্রোডাকশনে নয়।

## 4. প্রথম অ্যাডমিন + ডিফল্ট রোল (একবার)
`SEED_ADMIN_PASSWORD` env সেট থাকা অবস্থায় (SSH বা পিসি থেকে একই DB-তে):
```bash
npm run prisma:seed
```
এটা `admin@arvance.agency` অ্যাডমিন, ৪টা রোল (RBAC) এবং নমুনা কনটেন্ট তৈরি করে। এরপর **এই পাসওয়ার্ড বদলান** এবং `/<ADMIN_PATH>/login`-এ ঢুকে `Security` পেজ থেকে 2FA চালু করুন।
(পুরোনো ডাটাবেস আপগ্রেড করলে: `npm run rbac:sync`।)

## 5. ব্যাকগ্রাউন্ড জব (AI/queue) — ঐচ্ছিক
`CRON_SECRET` সেট করে hPanel → Cron Jobs-এ প্রতি মিনিটে:
```bash
curl -fsS -X POST https://YOUR-DOMAIN/api/jobs/run -H "x-cron-secret: YOUR_CRON_SECRET"
```

## 6. Stripe ব্যবহার করলে
Stripe Dashboard → Webhooks → endpoint `https://YOUR-DOMAIN/api/webhooks/stripe` (events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`) → signing secret (`whsec_…`) কে `STRIPE_WEBHOOK_SECRET`-এ বসান। **এটা না দিলে ওয়েবহুক 503 দেয় এবং অর্ডার "paid" হবে না** (ইচ্ছাকৃত — নকল পেমেন্ট ঠেকাতে)।

## 7. লাইভ হওয়ার পর যাচাই (৫ মিনিট)
1. `https://YOUR-DOMAIN/api/health` → `{"status":"ok","db":true}` (503 হলে DATABASE_URL/ডাটাবেস দেখুন)।
2. হোমপেজ, `/services`, `/blog`, `/contact` খুলুন।
3. Contact ফর্ম জমা দিন → অ্যাডমিন → Leads বোর্ডে লিড আসছে কিনা, এবং ইমেইল আসছে কিনা (SMTP সেট থাকলে)।
4. `/<ADMIN_PATH>/login`-এ লগইন → Leads, Blog, Services তৈরি/সম্পাদনা চেষ্টা করুন।
5. `/admin/login` যেন **404** দেয় (কাস্টম পাথ কাজ করছে)।
6. ব্রাউজার DevTools Console-এ `Content-Security-Policy-Report-Only` সংক্রান্ত লাল লেখা আছে কিনা দেখুন; লগে `[csp-violation]` জমা হলে বৈধ ডোমেইন CSP-তে যোগ করুন, তারপর `CSP_ENFORCE=true` দিয়ে rebuild।
7. `SENTRY_DSN` দিলে Sentry-তে একটা পরীক্ষামূলক এরর/ট্রেস আসছে কিনা দেখুন।

## 7ক. লাইভ হওয়ার পর আপনাকে যা কনফিগার করতে হবে (নইলে ফিচার "খালি" দেখাবে)
- **Consultation বুকিং:** অ্যাডমিন → *Booking Slots*-এ সাপ্তাহিক সময় (বার + শুরুর সময় + একই সময়ে সর্বোচ্চ কত বুকিং) যোগ করুন এবং *Booking Services* তৈরি করুন। কোনো স্লট না থাকলে বুকিং পেজে কোনো সময় দেখাবে না। ক্লায়েন্টের ইমেইলে মিটিং লিংক পাঠাতে `MEETING_LINK_URL` (আপনার Zoom/Meet রুম) সেট করুন; খালি থাকলে ইমেইলে "মিটিং বিবরণ পরে পাঠানো হবে" লেখা যায়।
- **শপ/চেকআউট:** বর্তমানে চেকআউট **অনলাইন কার্ড পেমেন্ট নেয় না** — অর্ডার তৈরি হয়, স্টক কমে, অর্ডার "payment pending" থাকে এবং কাস্টমার কনফার্মেশন পেজ দেখে (ব্যাংক ট্রান্সফার/ম্যানুয়াল পেমেন্টের জন্য উপযোগী)। Stripe Checkout যোগ করতে চাইলে আলাদা কাজ লাগবে (আপনার Stripe টেস্ট কী দরকার)। কর ১০% ও শিপিং $৫০ কোডে বাঁধা (`app/api/orders/route.ts`) — আপনার ব্যবসার হিসাবে বদলে নিন।
- **লাইভ চ্যাট (`/chat`, নেভবারে লিংক নেই):** `ANTHROPIC_API_KEY` ও অ্যাডমিনে একটি ChatBot তৈরি না করলে "চ্যাট এখন উপলব্ধ নেই" দেখায়।
- **Automation Services বুকিং ফর্ম ও Company Application ফর্ম** জমা পড়লে অ্যাডমিন → Leads বোর্ডে লিড হয়ে আসে (`source` = `service_booking` / `company_application`)।

## 8. রোলব্যাক
- কোড: আগের কমিট/zip আবার ডিপ্লয়।
- ডাটাবেস: `db push` শুধু নতুন টেবিল/কলাম যোগ করে; সমস্যা হলে ধাপ ৩-এর আগের backup রিস্টোর।

## 9. সাধারণ সমস্যা
| লক্ষণ | কারণ / সমাধান |
|---|---|
| Start-এ "Cannot start — fix these environment variables" | লেখা অনুযায়ী `DATABASE_URL` / `JWT_SECRET` (≥32 অক্ষর) সেট করুন |
| Build মাঝপথে থামে/"Killed" | `npm run build:lowmem` ব্যবহার করুন |
| সব পেজে 500, লগে Prisma `P2021 table does not exist` | ধাপ ৩ (`db push`) বাকি |
| অ্যাডমিন লগইন কাজ করছে না | HTTPS আছে কিনা; `JWT_SECRET` বদলালে আগের সেশন বাতিল হয় |
| ছবি লোড হয় না | `R2_PUBLIC_URL` সেট করুন (next/image-এ হোস্ট অনুমোদিত হয়) |
| Stripe ওয়েবহুক 503/400 | `STRIPE_WEBHOOK_SECRET` ঠিক আছে কিনা |
| `/api/ai/health` 503 | `GEMINI_API_KEY` নেই — AI ফিচার বন্ধ (বাকি সাইট চলে) |

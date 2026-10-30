# ফরেনসিক অডিট ও পরিবর্তন — AR Vance Agency OS

## ১. অডিটে যা পাওয়া গেছে (আগের অবস্থা)

| # | সমস্যা | প্রমাণ | অবস্থা |
|---|---|---|---|
| 1 | Admin থেকে তৈরি করা পেজ পাবলিক সাইটে দেখা যেত না (কোনো `/[slug]` route ছিল না) | `Page` model ও API ছিল, public route ছিল না | **ঠিক করা হয়েছে** — `/p/[slug]` |
| 2 | পেজ তৈরি/এডিট/ডিলিট/পাবলিশ করার UI ছিল না (শুধু তালিকা) | `admin/pages/page.tsx` ছিল ১৯৪ লাইনের read-only তালিকা | **ঠিক করা হয়েছে** — পূর্ণ manager |
| 3 | পেজ এডিটর ও PATCH/DELETE API ছিল না | `app/api/admin/pages/` শুধু GET/POST | **ঠিক করা হয়েছে** — `pages/[id]` |
| 4 | Header-এ "Get Started" বাটন | Navbar | **বদলানো হয়েছে** — "Get Free Marketing Audit" |
| 5 | Admin login ও sidebar-এ পুরনো brand "DigitalArch" | `admin/login`, `AdminSidebar` | **ঠিক করা হয়েছে** |
| 6 | Tailwind class ব্যবহৃত, কিন্তু Tailwind ইনস্টল ছিল না (৬১ ফাইল, ৯৬১ ব্যবহার) | `className` বিশ্লেষণ | **ঠিক করা হয়েছে** — Tailwind v4 |
| 7 | হেডার CSS (`.navbar`, `.burger`) ও admin/form/section CSS ছিল না | globals.css | **ঠিক করা হয়েছে** |
| 8 | Services পেজ খালি দেখাত (build-time freeze) | ISR + placeholder DB | **ঠিক করা হয়েছে** — dynamic render |
| 9 | ভুয়া সংখ্যা "24 AI Agents, 60+, 240+, 100%" | homepage | **সরানো হয়েছে** |
| 10 | Client-এ database call (team page) | browser `getSettings()` | **ঠিক করা হয়েছে** |

## ২. নতুন যা তৈরি হয়েছে

### পেজ বিল্ডার (Admin → Pages)
- **নতুন পেজ:** শিরোনাম দিলেই খসড়া তৈরি হয় এবং এডিটর খোলে। URL স্বয়ংক্রিয়ভাবে তৈরি হয় (বাংলা শিরোনামেও নিরাপদ slug)।
- **এডিট:** শিরোনাম, URL (slug), সংক্ষিপ্ত বিবরণ, SEO title, SEO description।
- **সেকশন (block):** Hero, Text, Image, CTA, Feature columns, FAQ। যোগ, সম্পাদনা, উপরে/নিচে সরানো, মুছে ফেলা।
- **ছবি:** প্রতিটি image/hero block-এ ছবি আপলোড (R2 বা local — বিদ্যমান upload API)।
- **পাবলিশ / আনপাবলিশ:** শুধু published পেজ পাবলিক URL-এ দেখা যায়; draft পেজ 404।
- **ডিলিট:** নিশ্চিতকরণসহ।
- **পাবলিক URL:** `/p/<slug>` — SEO title/description ও canonical সহ।

### অনুমতি (Permission)
- পেজ ব্যবস্থাপনা `manage_pages` permission-এর অধীনে। **Editor** ও **Sub Admin** রোলে এটি আছে, তাই মার্কেটিং টিম এই রোল দিয়ে কাজ করবে। আলাদা "Marketing" রোল এখনো তৈরি হয়নি।

### অডিট বাটন
- Header: **Get Free Marketing Audit** → `/free-marketing-audit`
- পেজ: `/free-marketing-audit` (marketing), `/free-business-audit` (business), `/free-seo-audit` (SEO)। সব অনুরোধ CRM-এ lead হিসেবে যায়, কোন ধরনের audit তা `auditType` দিয়ে চিহ্নিত।

### সার্ভিস ও আইটেম পেজ
- প্রতিটি service `/services/<slug>` (admin থেকে যোগ করলে স্বয়ংক্রিয়ভাবে পেজ তৈরি)।
- Portfolio, Blog, Shop, Team — প্রতিটি আইটেমের আলাদা পেজ আগে থেকেই আছে।

## ৩. যাচাই (প্রমাণ)

- **End-to-end পেজ flow (সার্ভারে):** ১৯/১৯ পাস — তৈরি, সেকশন সংরক্ষণ, draft সময় public-এ 404, publish, public rendering, SEO title, XSS payload text হিসেবে সংরক্ষিত, slug normalisation, unpublish, delete, অননুমোদিত ব্যবহারকারী 401।
- **XSS:** `<script>` ও `<img onerror>` payload escaped হয়ে দেখায়, কোনো raw HTML আউটপুটে নেই।
- **Browser screenshot:** public custom page, admin Pages manager, Free Marketing Audit পেজ।
- Build সফল, TypeScript ০ error, ESLint ০ error (warning আছে)।

## ৪. যা এখনো সম্পূর্ণ হয়নি (সৎ স্বীকারোক্তি)

1. **Elementor-স্টাইল ভিজ্যুয়াল drag-and-drop canvas তৈরি হয়নি।** এখন সেকশন ক্রমানুসারে সাজানো হয় (উপরে/নিচে), এবং প্রতিটি সেকশনের বিষয়বস্তু ফর্মে সম্পাদনা হয়। লাইভ প্রিভিউ সহ টেনে ছাড়ার বিল্ডার আলাদা বড় কাজ।
2. **সব পেজের ডিজাইন এখনো "অসাধারণ" নয়।** Hero, CTA ও card স্টাইল ঠিক হয়েছে; footer লিংকের কনট্রাস্ট, কিছু sidebar গ্রুপ ও mobile-এর পুরো পেজ এখনো যাচাই বাকি।
3. **Marketing রোল:** বর্তমানে Editor রোল ব্যবহার হচ্ছে। আলাদা Marketing রোল ও তার permission সেট তৈরি করা বাকি।
4. **অডিট-ফর্মের স্বয়ংক্রিয় রিপোর্ট:** অনুরোধ জমা ও টিমকে ইমেইল হয়। SMTP কনফিগার না থাকলে ইমেইল যায় না। রিপোর্ট তৈরির প্রক্রিয়া ম্যানুয়াল।
5. **অবশিষ্ট ঝুঁকি:** ৬৮টি custom class এখনো স্টাইলবিহীন (বেশিরভাগ team ও rich-text অংশে); ~১১২টি বাটন heuristic-এ handler ছাড়া দেখা গেছে, প্রতিটি ম্যানুয়ালি যাচাই বাকি; mock ডেটার analytics পেজ আছে।
6. **Hostinger deploy:** এখনো হয়নি।

## ৫. পরবর্তী ধাপের সুপারিশ
- ভিজ্যুয়াল page builder (drag-and-drop with live preview) — আলাদা প্রকল্প হিসেবে।
- আলাদা Marketing রোল ও audit-ফর্ম ইমেইল SMTP সহ যাচাই।
- সব পাবলিক ও admin পেজের browser screenshot যাচাই।


## ৬. শেষ রাউন্ডে যা বাকি ছিল, তা যা হয়েছে
- **Marketing রোল:** আলাদা `Marketing` রোল যোগ হয়েছে — পেজ, ব্লগ, পোর্টফোলিও, কন্টেন্ট, মার্কেটিং ও অ্যানালিটিক্স। ইউজার, সেটিংস, পেমেন্ট, AI-তে প্রবেশাধিকার নেই।
- **স্টাইলবিহীন class:** team, values, article, contact, rich-text, admin-nav ও footer-এর class-এর স্টাইল যোগ হয়েছে।
- **Footer কনট্রাস্ট:** লিংক ও লেখা এখন পাঠযোগ্য।
- **Hero বাটন:** "Get Free Marketing Audit" → `/free-marketing-audit`।
- **পরীক্ষার ডেটা:** test database থেকে smoke-test ডেটা (testimonial, service) সরানো হয়েছে; ZIP-এ কোনো test ডেটা নেই।

**যাচাই:** পেজ-বিল্ডার flow ১৯/১৯, role authorization ১২/১২, TypeScript ০ error, production build সফল, browser screenshot দেখে নিশ্চিত।

## ৭. এখনো যা বাকি (সৎ স্বীকারোক্তি)
1. Drag-and-drop ভিজ্যুয়াল page builder (লাইভ প্রিভিউ সহ) — আলাদা বড় প্রকল্প।
2. প্রতিটি পেজ ও প্রতিটি বাটন ম্যানুয়ালি যাচাই — browser-এ সব ক্লিক করে দেখা এখনো বাকি।
3. Audit-ফর্মের ইমেইল — SMTP কনফিগার না থাকলে যাবে না।
4. Hostinger-এ deploy।


## ৮. সর্বশেষ রাউন্ড (শেষ কাজ)
- **Drag-and-drop:** Admin page editor-এ সেকশন টেনে ছেড়ে ক্রম বদলানো যায়। পাশে live preview আছে (সংরক্ষণের আগের পরিবর্তনও দেখায়)। ↑/↓ বাটনও আছে।
- **Sidebar আইকন:** আকার ঠিক করা হয়েছে।
- **সব পাবলিক পেজ:** ২২টি route যাচাই — সব ঠিক (404 শুধু অস্তিত্বহীন slug-এ)।
- **সব admin পেজ:** ৭৮টি পেজ login করা অবস্থায় যাচাই — সব 200।
- **ভেতরের লিংক:** ১৯টি unique internal link যাচাই — কোনো ভাঙা নেই।
- **পেজ builder flow:** ১৯/১৯ পাস। **Role authorization:** ১২/১২ পাস।

## ৯. এখনো যা বাকি (বাস্তব সীমাবদ্ধতা)
1. **Hostinger deploy:** সরাসরি আমার অ্যাক্সেস নেই। GitHub বা hPanel দিয়ে আপনাকে করতে হবে।
2. **SMTP ইমেইল:** audit ফর্মের ইমেইল ও invoice ইমেইল চালু করতে আপনার SMTP host, user, password লাগবে।
3. **প্রতিটি বাটনের ক্লিক-পরীক্ষা:** লিংক ও পেজ যাচাই হয়েছে; প্রতিটি form submit ও modal বাটন ম্যানুয়ালি ক্লিক করে দেখা বাকি।
4. **Drag-and-drop বিস্তৃত করা:** এখন সেকশন তালিকায় টেনে সাজানো হয়; বিস্তৃত canvas (প্রতিটি সেকশনের ভেতরের element-ও টেনে সাজানো) আলাদা কাজ।

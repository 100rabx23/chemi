# PROJECT PLAN — Chemilinx redesign

## Creative direction (v2, redesign)
Tactile, editorial, enterprise. Reference: the owner's 100rabx.tech (preloader with stacked pills and counter, floating pill chrome with a local-time pill, flip-card word rotator, arched "doors" that open, scroll-driven reveals) combined with industrial-chemical restraint (BASF / Evonik-style typography and grids). Brand palette is kept: deep navy `#0f2833`, graphite `#1b2327`, off-white `#eceae5` / bone `#f6f5f1`, muted green (`#087f5b`, sage, mint).
- Type: Onest (variable, one family) for display and UI; JetBrains Mono for labels. Self-hosted and preloaded.
- Signature interactions: first-visit preloader (once per session); floating pill header + full-screen menu; hero flip-card cycling the six product families; **product-family doors** that open to list their products; rolling-digit catalogue counter; scroll-lit statements; sticky scroll-spy index on Industries; parallax photography; scroll-progress back-to-top ring. All honour `prefers-reduced-motion`.
- Imagery: only two usable photographs exist (a plant-floor photo and a laboratory flask). They are art-directed (desaturated, parallax, framed) and every product family has an original line illustration (`web/src/lib/art.tsx`). Replace with licensed photography when available.
- No fabricated statistics: the only figures shown (products, families) are counted live from the database.

## Architecture
```
chemilinx/
  server/  Express + TS + Prisma + Zod (REST under /api)
  web/     Vite + React + TS + Tailwind v4 + Router + Framer Motion (public site + /admin SPA, lazy-loaded)
```
Auth: bcrypt passwords; opaque session token in HTTP-only, SameSite cookie; only the SHA-256 hash is stored in `Session` (revocable on logout); CSRF defence via SameSite + required `X-Requested-With` header on mutations + Origin check. Roles: ADMIN, EDITOR (editors cannot delete or manage settings/users). Rate limits on login, inquiry and contact. Uploads: multer memory storage, magic-byte sniff (jpeg/png/webp), 4 MB cap, random filenames, served from `/uploads`. Email: nodemailer SMTP; failures are logged and never lose the saved record (`emailStatus` stored).
Production: Vercel serves `web`, rewriting `/api/*` and `/uploads/*` to the Render/Railway backend so cookies stay first-party.

## Sitemap
`/` Home · `/about` · `/products` · `/products/:slug` · `/industries` · `/why-chemilinx` · `/contact` · `/request-quote` · `/privacy-policy` · `*` 404
`/admin/login` · `/admin` (overview) · `/admin/products` · `/admin/categories` · `/admin/inquiries` (+ `/:id`) · `/admin/messages` · `/admin/settings` · `/admin/profile`

## Data model (Prisma / PostgreSQL)
AdminUser, Session, Category, Product, Inquiry, InquiryItem, ContactMessage, SiteSetting, AuditLog. Enums: Role, InquiryStatus (NEW, IN_PROGRESS, QUOTED, CLOSED, SPAM), MessageStatus.

## Roadmap
1. Audit + plan (done) 2. Schema, migrations, seed 3. API + auth + email + tests 4. Design system + public pages 5. Admin dashboard 6. Wire, E2E verification in browser, a11y/SEO/Lighthouse 7. Docs + deployment config.

# Chemilinx — website, API and admin

A redesigned corporate site for Chemilinx (chemical distribution, Ankleshwar GIDC, Gujarat). Business content comes from the existing chemilinx.in — see [CONTENT_AUDIT.md](CONTENT_AUDIT.md). Architecture and roadmap: [PROJECT_PLAN.md](PROJECT_PLAN.md). API reference: [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

```
server/   Express + TypeScript + Prisma + Zod + PostgreSQL
web/      Vite + React + TypeScript + Tailwind v4 + React Router + Framer Motion (public site AND /admin)
```

## Run locally

Requirements: Node 20+ and a PostgreSQL 14+ database (Docker or a local install).

```powershell
# 1. Database (pick one)
docker compose up -d            # Postgres on :5433, matches server/.env.example
# or point DATABASE_URL at any Postgres you have

# 2. API
cd server
copy .env.example .env          # then edit: set SEED_ADMIN_PASSWORD (min 10 chars)
npm install
npx prisma migrate deploy       # applies migrations (use `npm run db:migrate` while developing)
npm run db:seed                 # 6 categories, 25 products, settings, first admin user
npm run dev                     # http://localhost:4000

# 3. Website (new terminal)
cd web
npm install
npm run dev                     # http://localhost:5173  (proxies /api and /uploads to :4000)
```

Admin console: `http://localhost:5173/admin` — sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
Change that password in **Admin → Profile** straight away. The seed only creates the admin if it does not already exist.

> Windows note: the optional `npm run db:local` (embedded Postgres, no Docker) fails when the project path exceeds ~260 characters. Use Docker, a system Postgres, or run it from a short path such as `C:\cx`.

## Tests

```powershell
cd server; npm test     # 15 integration tests against the real DB (creates/removes "ZZTEST" rows)
cd web;    npm test     # content integrity tests
cd web;    npm run build   # type-check + production build
```

## Admin setup

1. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `server/.env` (or the host's env) and run `npm run db:seed` (`npm run db:seed:prod` against the compiled build).
2. Sign in at `/admin`, change the password, then open **Settings** and set the notification email and confirm contact details.
3. Roles: `ADMIN` (everything) and `EDITOR` (create/edit products, categories, inquiries, messages; cannot delete products/categories or change settings). Extra users can be added with a one-off script modelled on `prisma/seed.ts` (a user-management UI is not included).

## Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and the notification address (`NOTIFY_EMAIL` or Admin → Settings). On each quotation request or contact message the record is saved first, then a notification goes to the business address and a confirmation to the customer. If SMTP is unset or fails, the record is still saved and its `emailStatus` (SKIPPED / FAILED) is shown in the admin. **Email sending has not been tested against a real SMTP server** — only the skip path was exercised.

## Deployment (suggested: Vercel + Render + managed Postgres)

Nothing here modifies or replaces the live chemilinx.in. Nothing has been deployed.

1. **Database + API (Render):** apply `render.yaml` as a Blueprint (or create a Postgres + Node web service by hand with `rootDir: server`). Build: `npm ci && npm run build`; pre-deploy: `npm run db:deploy`; start: `npm start`. Set env vars from `server/.env.example`; `COOKIE_SECURE=true`; `CLIENT_ORIGIN=https://<your site domain>`. Then run the seed once in the Render shell: `SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run db:seed:prod`.
2. **Uploads:** product images are written to `UPLOAD_DIR`. Use a persistent disk (as in `render.yaml`) — otherwise uploads vanish on redeploy. For multi-instance scaling move uploads to S3/R2.
3. **Website (Vercel):** import the repo with root directory `web`; framework Vite. Edit `web/vercel.json` and replace `REPLACE-WITH-YOUR-BACKEND` with the API host. The rewrites make `/api` and `/uploads` same-origin, which the cookie-based admin session relies on.
4. Point the domain at Vercel only after content review. Keep the old site live until then.

Production checklist: HTTPS only; strong admin password; SMTP configured; `CLIENT_ORIGIN` exact; database backups enabled; review `CONTENT_AUDIT.md` open questions.

## Security notes

bcrypt (cost 12) password hashes; opaque session tokens in HTTP-only, SameSite=Lax cookies (only SHA-256 stored, revoked at logout and on password change); CSRF guard (`X-Requested-With` header + Origin allow-list) on mutations; Zod validation on every body; rate limits on login (10/15 min) and public forms (8/15 min per IP); Helmet headers; image uploads are magic-byte checked, size-capped and renamed; audit log of admin writes; honeypot field on public forms; all output rendered by React (escaped) and email HTML escaped.

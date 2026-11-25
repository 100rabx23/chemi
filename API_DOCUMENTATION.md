# API documentation

Base path `/api`. JSON in/out. Errors: `{ "error": string, "details"?: { field: string[] } }` with 400 (validation), 401, 403, 404, 409, 413, 415, 429, 500.
Admin and auth **mutations** (POST/PUT/PATCH/DELETE) must send `X-Requested-With: XMLHttpRequest`; the browser `Origin` must be in `CLIENT_ORIGIN`. Auth is the HTTP-only cookie `cx_session`.

## Public

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ ok: true }` |
| GET | `/categories` | `{ items: Category[] }` each with `productCount` (published only) |
| GET | `/products` | Query: `search`, `category` (slug), `featured=true`, `page`, `pageSize` (≤100). Published only. → `{ items, total, page, pageSize }` |
| GET | `/products/:slug` | → `{ product, related[] }`; 404 if missing/unpublished |
| GET | `/site` | → `{ contact, testimonials }` (testimonials empty until enabled in admin) |
| POST | `/inquiries` | Rate limited. Body below → 201 `{ reference, emailStatus }` |
| POST | `/contact` | Rate limited. `{ name, email, phone?, subject?, message (≥10) }` → 201 `{ ok, emailStatus }` |

`POST /inquiries` body: `{ customerName, companyName, email, phone, message?, items: [{ productId, quantity > 0, unit: "kg"|"MT"|"litre"|"drum"|"other" }] }` (1–20 items; a `productName` may replace `productId` for unlisted products). A hidden `website` field is a honeypot.

## Auth

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | `{ email, password }` → sets cookie, `{ user }`. 10 attempts / 15 min / IP |
| POST | `/auth/logout` | Revokes the session, clears cookie |
| GET | `/auth/me` | `{ user: { id, email, name, role } }` or 401 |

## Admin (cookie required; `ADMIN` or `EDITOR` unless noted)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | totals, new/pending inquiries, new messages, recent inquiries |
| GET | `/admin/products` | `search`, `category` (id), `published`, `page`, `pageSize` |
| GET | `/admin/products/:id` | |
| POST | `/admin/products` | `{ name, description, categoryId, imageUrl?, specifications[{label,value}], featured, published, sortOrder, slug? }` |
| PUT | `/admin/products/:id` | Same body |
| DELETE | `/admin/products/:id` | **ADMIN only** |
| GET/POST | `/admin/categories`, PUT `/admin/categories/:id` | `{ name, slug?, tagline?, description?, sortOrder }` |
| DELETE | `/admin/categories/:id` | **ADMIN only**; 409 while products exist |
| POST | `/admin/uploads` | multipart field `file`; JPEG/PNG/WebP ≤ 4 MB → `{ url: "/uploads/<random>.<ext>" }` |
| GET | `/admin/inquiries` | `status`, `search`, `page`, `pageSize` |
| GET | `/admin/inquiries/:id` | with `items` |
| PATCH | `/admin/inquiries/:id` | `{ status?: NEW|IN_PROGRESS|QUOTED|CLOSED|SPAM, internalNotes? }` |
| GET | `/admin/messages` | `status`, `search`, paging |
| PATCH | `/admin/messages/:id` | `{ status: NEW|READ|REPLIED|ARCHIVED }` |
| GET | `/admin/settings` | all settings |
| PUT | `/admin/settings` | **ADMIN only**; keys `contact`, `notifications`, `testimonials` |
| GET/PATCH | `/admin/profile` | `{ name?, currentPassword?, newPassword? }` (≥10 chars, upper+lower+digit); a password change revokes other sessions |

Every admin write is recorded in `AuditLog` (user, action, entity, id, IP).

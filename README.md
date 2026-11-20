# BAYAN GROUP — corporate website, client portal and CMS/CRM

Production-shaped marketing site for a Qatar-based multi-disciplinary group, with four divisions, a working enquiry pipeline, a client portal, and a database-driven admin panel.

**Stack:** Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS 4, Zod, `node:sqlite` (local) / PostgreSQL (production), Lucide icons. No UI kit, no CMS SaaS, no auth SaaS.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local          # optional for local; defaults work as-is
npm run db:reset                    # create data/bayan.db and seed content + users
npm run dev                         # http://localhost:3000
```

Requires **Node 22.5+** (tested on Node 26) because the local database uses the built-in `node:sqlite` module.

Seeded accounts:

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `admin@bayan-group.qa` | `ChangeMe123!` |
| Editor | `editor@bayan-group.qa` | `Editor123!` |
| Client | `client@example.com` | `Client123!` |

Change these before any deployment. `ADMIN_EMAIL` / `ADMIN_PASSWORD` override the admin account at seed time.

---

## 2. What is implemented

### Public site (17 routes + product pages)

`/` · `/about` · `/divisions` · `/divisions/technologies` · `/divisions/advisory` · `/divisions/trading` · `/divisions/investments` · `/divisions/trading/[product]` · `/insights` · `/insights/[slug]` · `/case-studies` · `/case-studies/[slug]` · `/careers` · `/contact` · `/consultation` · `/confirmation` · `/privacy` · `/terms` · `/cookies` · `/regulatory` · 404

- Sticky header with transparent-to-solid scroll state, keyboard/touch mega-menu, full-screen mobile drawer, EN/AR switch, client login link.
- Home sections: hero, group introduction, four division panels, principles, four-step method with scroll reveals, latest insights, case studies, call to action.
- Division pages carry full content, capabilities, method, FAQ, and an enquiry form routed to that division. Trading adds a searchable/filterable catalogue; each product has a detail page with RFQ form.
- Technologies form adds Odoo module multi-select; Advisory adds an on-page financial health assessment with a non-advice disclaimer; Investments adds a calculator with the formula and assumptions printed under the result.
- Legal pages are rendered from the `pages` table (admin-editable), so no regulatory claim is hardcoded.
- Arabic (RTL) at parity for navigation, homepage, divisions, forms, validation, portal labels and admin chrome. Locale is a cookie (`bayan_locale`); switching reloads the document so `<html lang dir>` updates.

### Enquiry pipeline (CRM)

- Dynamic form: name, company, email, phone, country, division, enquiry type, subject, message, attachment, consent.
- Server-side Zod validation, per-IP rate limiting (`rate_limits`), honeypot-free but throttled; safe error messages.
- Reference numbers `BYN-YYYY-NNNN` / `RFQ-YYYY-NNNN`, unique in the database.
- Row is written **before** the confirmation page renders; confirmation only echoes the reference and never personal data.
- Acknowledgement email to the sender plus an internal notification, sent through Resend when `RESEND_API_KEY` is set, otherwise written to `data/outbox/*.eml`.
- Attachments are validated by MIME + extension + magic bytes, capped at 5 MB, and stored in `data/private` (outside the web root), reachable only through an authorised route.

### Admin panel (`/admin`)

Roles: **Super Admin**, **Editor**, **Division Manager**, **Sales/BD**, **Client** (client accounts are redirected to the portal).

- Overview KPIs computed from the database: total/open enquiries, last 7 days, proposals awaiting decision, active projects, client accounts, RFQ backlog, published articles, plus enquiries-by-division and the latest leads.
- Leads & Enquiries: search, status/division/date filters, sort, pagination, CSV export (same filters as the screen), detail page with message, metadata, private attachment, status/priority/assignment, internal notes, and an audit-backed activity trail. Division managers only see their division.
- Clients: searchable list with activity counts; detail page with projects, enquiry history, documents, message thread, reply box and document sharing.
- Projects: create/edit/delete with client, division, status, progress, dates; references `BYN-PRJ-YYYY-NNNN`.
- Product catalogue: create/edit/delete, visibility and featured flags, slug uniqueness; changes appear on the Trading catalogue.
- RFQs: filter by status and update status inline.
- Articles: create/edit/delete, draft/publish, bilingual fields, Markdown body, generated slugs, redirect to the editor after creation.
- Media library: image upload to `public/uploads`, alt text, path copy, delete.
- Website pages: Markdown editor for the legal pages plus SEO title/description and publish state.
- Users & permissions: create users, change role/division/status, reset passwords; super-admin only, self-lockout prevented.
- Website settings: company, tagline, contact, address, hours, socials, email notification flag, legal note — all reflected on the public site immediately.
- SEO settings: default bilingual title/description, links to generated `sitemap.xml`, `robots.txt`, `llms.txt`.
- Audit log: append-only record of logins, form-adjacent staff actions, status changes, uploads, settings write; filterable and paginated.
- Destructive writes are guarded server-side; every admin page and action calls `requireStaff()` and role checks.

### Client portal (`/portal`)

- Register, sign in, forgot password, reset password (single-use hashed token, 1 hour, invalidates sessions).
- Overview with real counts and active projects; My Enquiries (own records by account or email); My Projects with progress; Documents (upload, private download, delete — ownership enforced); Messages thread with read receipts; Profile; Password & security with active session list.
- Every page is guarded in the layout and every query is scoped by `client_id`/email; there is no cross-client access (verified: another client receives 404 on a document download).

---

## 3. Project layout

```
bayan-group/
├── database/schema.sql          # tables, constraints, indexes (source of truth)
├── scripts/db.mjs               # migrate | seed | reset, scrypt hashing, bilingual seed data
├── scripts/smoke.mjs            # HTTP smoke test against a running server
├── tests/                       # node:test unit + database tests
├── data/                        # bayan.db, private/ (attachments), outbox/ (dev email)
├── public/uploads/              # public CMS media
└── src/
    ├── app/
    │   ├── (site)/              # public routes, shared header/footer layout
    │   ├── portal/              # auth screens + (app) guarded portal
    │   ├── admin/               # login + (app) guarded admin
    │   ├── actions/             # server actions: enquiry, auth, portal, admin
    │   ├── api/                 # locale switch, uploads/attachments, CSV export
    │   ├── sitemap.ts robots.ts llms.txt/route.ts
    │   └── layout.tsx globals.css not-found.tsx
    ├── components/              # Header, Footer, forms, portal/admin UI
    └── lib/                     # db, auth, password, validation, i18n, content,
                                 # email, uploads, markdown, admin-query
```

### Data model

`users`, `sessions`, `password_resets`, `enquiries`, `enquiry_notes`, `projects`, `documents`, `messages`, `products`, `rfqs`, `articles`, `case_studies`, `pages`, `testimonials`, `faqs`, `settings`, `media`, `audit_log`, `rate_limits`. Foreign keys are enforced; `CHECK` constraints bound statuses and progress.

### Request flow

Server components read the database directly. Mutations are Server Actions that: rate-limit → validate with Zod → authorise → write → audit → email → `revalidatePath` or `redirect`. Client components never receive a database handle; rows are converted to plain objects at the query boundary so they can cross the RSC boundary safely.

---

## 4. Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc --noEmit
npm test           # unit + database tests (isolated temp DB)
npm run smoke      # HTTP smoke test against BASE_URL (default :3000)
npm run db:reset   # drop rows, re-seed demo content
npm run db:seed    # seed without dropping
```

`npm run smoke` expects a running server, for example:

```bash
npm run build && PORT=3100 npm start &
BASE_URL=http://localhost:3100 npm run smoke
```

### Test coverage

- **Unit:** Markdown escaping and link sanitising, i18n dictionary, enquiry/RFQ/registration validation, division scoping and filter sanitising for the admin query builder, password hashing.
- **Database:** seed integrity, roles, admin password verification, settings read/write, reference numbering, foreign-key enforcement, plain-object rows.
- **HTTP smoke:** every public route returns 200 with expected content, canonical tags and `lang`; generated files exist; admin/portal redirect; API auth returns 401; 404; Arabic RTL rendering.
- **Manual browser pass (recorded during development):** contact submission → reference and two outbox emails; admin status/priority/assignment change with audit trail and note; staff portal reply and read receipt; document upload, owner download (200), other client (404), anonymous (401); RFQ submission and status change; article creation → redirect → published on `/insights`; settings save reflected in the footer; validation errors on invalid input; locale switch preserving page and direction.

---

## 5. Configuration

### Email

| Variable | Behaviour |
| --- | --- |
| `RESEND_API_KEY` | Sends through `https://api.resend.com/emails`. |
| `EMAIL_FROM` | Sender, e.g. `BAYAN GROUP <hello@yourdomain.qa>`. Must be a verified Resend domain. |
| none | Writes `.eml` files to `data/outbox/`; every flow stays testable offline. |

To use another provider, replace `sendMail` in `src/lib/email.ts` — the rest of the app only depends on its signature.

### Storage

- Public media: `public/uploads`, served directly, referenced by the media library.
- Private client/enquiry files: `data/private`, served only after an ownership or staff check. Back this directory up with the database.

### Domain and HTTPS

1. Point the domain at the host and terminate TLS (platform default or a reverse proxy).
2. Set `NEXT_PUBLIC_SITE_URL=https://your-domain` so canonical URLs, sitemap and email links are correct.
3. `robots.txt` disallows `/admin`, `/portal`, `/api`, `/confirmation`; admin and portal layouts also send `noindex`.

---

## 6. Production deployment

### Database

Local development uses SQLite deliberately to keep the repo runnable with zero external services. For production you have two options:

1. **Managed Postgres (recommended, e.g. Supabase/Neon).** Port `src/lib/db.ts` to a Postgres client, translate `database/schema.sql` (SQLite → Postgres types), and move `data/private` to object storage with signed URLs. Every query is centralised in that file and the route handlers, so the change is contained.
2. **Single-instance SQLite.** Keep as-is on a host with a persistent disk. Suitable for low write volume, but not for multi-instance/serverless deployment.

Do not deploy the SQLite build to a serverless platform without moving to Postgres — the filesystem is not durable or shared.

### Checklist before going live

- [ ] Set `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
- [ ] Replace the seeded admin password and delete demo client/editor accounts (or change their passwords).
- [ ] Fill company name, tagline, contact details, address, hours and the legal note in **Admin → Website Settings**. The footer intentionally says registration/licence details must be verified — replace it with real values or leave it out.
- [ ] Review the four legal pages in **Admin → Website Pages** with a qualified adviser; they are templates, not legal advice.
- [ ] Confirm catalogue copy, prices notes and lead times are accurate; nothing is sold or paid for on the site.
- [ ] Add real case studies/testimonials only where written permission exists (seed data is illustrative and must be replaced or removed).
- [ ] Configure backups (see below) and test a restore.

### Backups

- Database: `sqlite3 data/bayan.db ".backup 'backup-$(date +%F).db'"` on a schedule (or managed Postgres PITR). Keep at least 7 daily and 4 weekly copies off-host.
- Files: snapshot `data/private` and `public/uploads` with the database backup so document rows never point at missing files.
- Test restore into a staging instance before relying on it.

### Security notes

- Passwords: scrypt with per-user salt; sessions are random 256-bit tokens stored as SHA-256 hashes, httpOnly + SameSite=Lax cookies, 7-day expiry, revoked on password change.
- All admin and portal routes call `requireStaff()` / `requireUser()` on the server; no client-side-only gating, no middleware reliance.
- Uploads are type/size/magic-byte checked and never served from the private directory.
- Every mutation validates with Zod or explicit bounds; SQL is always parameterised.
- Rate limits: enquiry/RFQ 5 per 10 minutes per IP, login 8 per 5 minutes, registration 5 per hour, password reset 4 per 15 minutes.
- Audit log records staff actions with user id, IP and timestamp.
- Add a WAF/CDN and TLS at the edge for production; responses set `X-Content-Type-Options: nosniff` on downloads.

---

## 7. Logo assets

Vector and high-resolution PNG versions of the header logo live in `brand/` (see `brand/README.md` for sizes, colours and usage rules). Regenerate them with `scripts/brand/generate.py` and `scripts/brand/rasterise.sh`.

## 8. Deliberate limitations

- No payment processing anywhere (Trading is quotation-only, Investments is informational). This is intentional and stated on the pages.
- Email is Resend-or-outbox; there is no SMTP transport.
- No SMS/2FA, no OAuth social login.
- Single locale cookie rather than `/ar` URL prefixes, so Arabic pages share the same URLs (SEO trade-off; hreflang alternates would be the next step).
- Demo case studies, testimonials and phone/address placeholders must be replaced with verified facts.
- SQLite is development/single-instance only.

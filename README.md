# VIKAS HANDLOOM - E-commerce catalogue & virtual showroom
deployed url:https://vikas-handloom.pages.dev/
for Demo experience admin password: PLeXCbutVZYiTzglH7jhvGIx
Free/open-source stack, runs fully on a local computer: **React + TypeScript + Tailwind (Vite)**, **Spring Boot 3 / Java 21**, **Spring Security + JWT + BCrypt**, **MySQL** (or the built-in H2 file DB), local image storage. No paid service is required anywhere.

```
vikas-handloom/
  backend/    Spring Boot API (auth, catalogue, media, admin, access management)
  frontend/   React app (public pages, shop, virtual showroom, admin dashboard)
  scripts/    start-backend.ps1, smoke-test.ps1 (security tests)
```

## 1. Requirements
Java 21, Node 20+, and either MySQL 8 (default) or nothing (H2 mode). Maven is bundled via `mvnw`.

## 2. Run locally
**Backend** (terminal 1)
```powershell
cd backend
copy .env.example .env        # edit: DB_PASSWORD, JWT_SECRET, ADMIN_PASSWORD
cd ..
./scripts/start-backend.ps1        # MySQL (database `vikas_handloom` is auto-created)
./scripts/start-backend.ps1 -H2    # OR: no MySQL needed, data in backend/data
```
**Frontend** (terminal 2)
```powershell
cd frontend
npm install
npm run dev        # http://localhost:5173  (proxies /api -> http://localhost:8080)
```

## 3. Admin login
The admin account is created on first start. Username = `ADMIN_USERNAME` (default `admin`). Password = `ADMIN_PASSWORD`; if empty, a random one is **printed once** in the backend console. Setting `ADMIN_PASSWORD` later resets the admin password on next start. Open http://localhost:5173/login.

## 4. Giving customers temporary access
Admin dashboard -> **Customer access** -> *Generate customer credentials*: choose name/note, count, *active from*, *valid for N days* (or an exact expiry date) and an optional **usage limit in minutes counted from first login** (re-logging in never extends it). The random username/password is shown **once** (stored only as a BCrypt hash). From the same page you can **Revoke / Enable** (takes effect immediately, even for live JWTs), **Edit** dates/limits, **Reset** credentials, **Delete**, and see Active / Scheduled / Expired / Disabled status and time left.
Customers log in at `/login`, see a countdown, and are logged out automatically when time runs out. Customers cannot extend access.

## 5. Security design
- BCrypt (strength 11) password hashes; no plain-text passwords stored.
- JWT (HS256) with `jti`; expiry = earliest of account expiry / usage window (max 24 h per token, 8 h for admin).
- **Every request** also checks the server-side `access_sessions` row + account state (enabled, start date, expiry), so revoke/disable/logout/expiry work instantly - not just in the frontend.
- Roles `ADMIN` / `CUSTOMER`; `/api/admin/**` is admin-only (403 for customers); everything except login, `/api/public/**` is authenticated.
- Secrets only via environment variables (`JWT_SECRET`, DB creds, admin password). If `JWT_SECRET` is unset a random one is generated at startup (sessions then don't survive a restart).
- Login brute-force limiter (8 failures / 15 min per username+IP). Upload validation (real JPG/PNG only, 8 MB).
- The token is kept in `sessionStorage` (cleared when the tab closes). This is a deliberate trade-off vs. cookies; it avoids CSRF, but any XSS bug could read it - there is no user-generated HTML in the app.
- Run `./scripts/smoke-test.ps1 -AdminPassword <pw>` against a running backend to verify: unauthenticated 401, customer blocked from admin APIs (403), revoke kills a live JWT, logout invalidates, expired accounts rejected.

## 6. Image / screenshot protection (honest limits)
Implemented deterrents: images are served only to logged-in users through `/api/media/{id}`, customers receive a **downscaled, watermarked** copy (originals only for admin), images are fetched as blobs (no shareable direct URLs), right-click/drag/long-press disabled on media, print hidden for previews, watermark overlay on the showroom.
**A website cannot prevent screenshots, screen recording, browser developer tools, or photographing the screen with another phone.** These measures only discourage casual copying.

## 7. Virtual showroom
`/showroom` has working previews for **bedsheets (single/double bed), comforters, pillow covers, sofa covers (1/2/3-seater, L-shaped), cushions, curtains (window/door), carpets, table covers**. Designs come from your real catalogue products (their pattern + colour, or their uploaded photo as texture) plus a free colour/pattern builder.
- The scenes are **drawn illustrations (SVG)**, not photographs - no stock photos were bundled because none were supplied.
- **Our rooms**: in Admin -> *Preview rooms* upload real room photos and outline the fabric area; customers can then apply fabrics to *your* photos.
- **Upload my room**: customer uploads a photo (stays in the browser), outlines the area, and the fabric is tiled inside the outline and blended (multiply keeps original light/shadow). **Limits:** it is flat 2D - no perspective, folds or occlusion; edge quality depends on the outline. No AI is used; `RoomCompositor` is the single place to swap in an AI placement service later.

## 8. Products & demo data
First start seeds 17 categories (all those you listed) and 51 **DEMO** products (no real prices -> "Price on request"; generated fabric swatches). Delete them or edit them in Admin. Set `SEED_DEMO_DATA=false` to start empty. Prices are optional; product pages use WhatsApp/call enquiry (there is no cart/payment - it is a catalogue for a physical shop). Shop timings are blank until you enter them in Admin -> *Shop settings*.

## 9. Database
Schema is created automatically by JPA (`ddl-auto=update`). Main tables: `app_users`, `access_sessions`, `categories`, `products` (+ `products_image_ids`, `products_variants`), `media_files`, `preview_templates`, `site_settings`. For MySQL, create a dedicated DB user instead of root for real use.

## 10. Free deployment options (not required - local works without any)
| Part | Free-tier option | Watch out for |
|---|---|---|
| Frontend (`npm run build` -> `dist/`) | Cloudflare Pages, Netlify, GitHub Pages | Set `VITE_API_URL` to the backend URL; add that origin to `CORS_ORIGINS`. |
| Backend (JAR) | Render, Fly.io, Railway free/trial tiers, or a home PC + Cloudflare Tunnel | Free tiers sleep/limit hours and may change or end; Render free disk is ephemeral. |
| MySQL | Aiven free MySQL, TiDB Cloud Serverless free tier, or H2 file DB on a persistent disk | Storage/row quotas, idle shutdown. |
| Image storage | Local disk (default) or Cloudflare R2 free tier (10 GB) via a new `MediaService` adapter | Free quotas; ephemeral disks on free hosts lose uploads. |
| Domain | Free `*.pages.dev` / `*.onrender.com` subdomain | A custom domain costs money - not needed. |
Quotas and prices change - check each provider before relying on them. Always use HTTPS in production.

## 11. Known limitations
Showroom scenes are illustrations; room-upload compositing is basic; no online cart/checkout; no password-change UI for the admin (set `ADMIN_PASSWORD` and restart); no automated frontend tests; Google Fonts and the Google Maps embed need internet (the site works without them, with fallback fonts and a map link).

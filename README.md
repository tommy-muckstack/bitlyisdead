# BitlyIsDead

Free, open-source short links, QR Codes, link-in-bio pages and campaigns with click analytics. Part of [IsDead](https://yourappisdead.com): open-source clones of paid SaaS. Served at `https://yourappisdead.com/bitlyisdead`; short links live at `/bitlyisdead/s/<code>`, pages at `/bitlyisdead/p/<slug>`.

- **Homepage** (`/`): mirrors Bitly's homepage structure (shorten-a-link hero, bento, use cases, orange footer) with original copy and art. `/pricing` shows Bitly's real prices (October 2026) next to our $0; `/compare` is the feature table.
- **Auth** (`/login`, `/forgot-password`, `/welcome`): shared IsDead Firebase auth (email/password + Google), a demo account in demo mode, and no-signup **guest sessions** (work is adopted by the account on sign-in).
- **App** (`/app`): Home with quick create · Links (tags, filters, sort, hide, bulk actions) · create flow with UTM builder and QR toggle · QR Codes (templates, patterns, corners, colours, frames, logo; PNG/SVG/JPEG; scans) · Pages (link-in-bio builder, themes, blocks, public URL with views and per-button clicks) · Analytics (date range, top links, referrers, devices, browsers, countries, cities) · Campaigns (shared UTMs, rolled-up analytics) · Custom domains (real DNS verification; routing needs self-hosting) · Settings (profile, password, API tokens, billing) · Upgrade (never takes payment).
- **API** (`/developers`): everything above over JSON with `Authorization: Bearer bid_…` tokens from Settings → API.
- **Redirect** (`/s/<code>`): 307 with `no-store` so every visit is counted; `?r=qr` counts a scan instead of a click. Crawlers and link-preview bots are counted separately. Off, expired and unknown links return a clear 410/404 page. Locations use only the country/city headers the platform attaches (never the IP).
- **Safety:** only public http(s) destinations are accepted (no `javascript:`, `file:`, localhost, private IPs, embedded credentials, or other short links); redirects only ever go to the stored, validated URL.

Design: theme `bitly` in `vendor/isdead-design`; brand mark is the IsDead tombstone on Bitly orange (original art); font Lexend (OFL) as a lookalike for Bitly's proprietary face.

## Run

```
npm ci
NODE_OPTIONS=--unhandled-rejections=warn npm run dev   # http://localhost:3000/bitlyisdead (demo account + guests in dev)
npm test && npm run typecheck
npm run build && npm run shots   # production smoke test + screenshots
BASE=http://localhost:3000/bitlyisdead node scripts/e2e-shell.mjs   # one per feature area: shell, links, create, qr, pages-campaigns, domains-settings, analytics, auth-marketing
```

Env (production): `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `AUTH_SECRET` (also enables guest sessions; `GUESTS=0` disables), optional `DEMO_MODE=1`, `ISDEAD_DATA_DIR`. Without Firebase env the app runs on JSON files with the demo account and guests.

## Parity

`docs/PARITY_REPORT.md` tracks every finding from the 2026-10-15 QA pass against Bitly (fixed / justified exception) with before/after screenshots in `docs/qa/2026-10-15/`.

## Gaps

- **Custom domain routing:** domains verify by DNS, but the hosted deployment can't answer for another host; point the CNAME at a self-hosted copy.
- **Not built:** bulk CSV upload, mobile deep links, teams/groups, SSO, saved UTM templates, QR Code bulk creation.
- Short links are `/bitlyisdead/s/<code>` (not a bare short domain) until a short domain is attached.
- Each click rewrites the link document, which won't scale to very hot links (use counters or a queue in production).

Not affiliated with Bitly. Apache-2.0.

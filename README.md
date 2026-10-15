# BitlyIsDead

Free, open-source short links with click analytics and QR codes. Part of [IsDead](https://yourappisdead.com): open-source clones of paid SaaS. Served at `https://yourappisdead.com/bitlyisdead`; short links live at `/bitlyisdead/s/<code>`.

- **Homepage** (`/`): mirrors Bitly's homepage structure (shorten-a-link hero, steps, feature rows, stats, price comparison at `#pricing`) with original copy and art.
- **Login** (`/login`): shared IsDead Firebase auth (email/password + Google); one demo account in demo mode.
- **App** (`/app`, `/app/l/<code>`): create links (auto 6-char code or custom back-half, title, expiry), search, copy, turn off/on, edit destination, delete; per-link 30-day chart, top referrers, devices, browsers; QR code download (PNG and SVG).
- **Redirect** (`/s/<code>`): 307 with `no-store` so every visit is counted. Crawlers and link-preview bots are counted separately and never inflate clicks. Off, expired and unknown links return a clear 410/404 page.
- **Safety:** only public http(s) destinations are accepted (no `javascript:`, `file:`, localhost, private IPs, embedded credentials, or other short links); redirects only ever go to the stored, validated URL.

Design: theme `bitly` in `vendor/isdead-design` (canonical `/workspace/isdead-design`); font Lexend (OFL) as a lookalike for Bitly's proprietary face.

## Run

```
npm ci
npm run dev            # http://localhost:3000/bitlyisdead  (demo account in dev)
npm test && npm run typecheck
npm run build && npm run shots   # production smoke test + screenshots
```

Env (production): `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `AUTH_SECRET`, optional `DEMO_MODE=1`, `ISDEAD_DATA_DIR`.

## Gaps

- **Storage:** `lib/store.ts` writes JSON files; Vercel's disk is ephemeral, so production needs the Firestore swap (same collection/id → JSON shape). Each click rewrites the link document, which won't scale to very hot links (use counters or a queue in production).
- **Not built:** custom domains, bulk creation, UTM builder, deep links, link-in-bio pages, geography (city/country) and an API with keys.
- Short links are `/bitlyisdead/s/<code>` (not a bare short domain) until a short domain is attached.
- Sign-in has not been tested against the live Firebase project (keys pending).

Not affiliated with Bitly. Apache-2.0.

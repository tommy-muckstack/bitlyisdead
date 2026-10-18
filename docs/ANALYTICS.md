# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead sub-app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how BitlyIsDead follows it.

> **Two different "analytics" in this repo.** `lib/analytics.ts` and `components/Analytics.tsx` are the *product's* link
> click/scan stats (the Analytics tab). They have nothing to do with PostHog. The PostHog client lives in
> **`lib/telemetry/`** so the two never collide.

## Setup
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token (safe in the browser); `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`. No key → telemetry is a no-op. Both are already set on the Vercel project.
- Reverse proxy through the app's own origin: `/bitlyisdead/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true`).
- `<Analytics />` from `lib/telemetry/posthog` is mounted once in `app/layout.tsx`; it boots the client and sends PostHog's `$pageview` per route change. Autocapture and session replay are off.
- posthog-js drops automated browsers. In dev, `localStorage.isdead_ph_debug = "1"` turns on verbose logs and lets Playwright capture (used by the verification script); production keeps the bot filter.

## Super properties (on every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `bitlyisdead` | the one property to filter by |
| `surface` | `landing` \| `app` | `landing` = marketing pages, pricing, login, welcome; `app` = `/app/*`, public Pages `/p/*`, short-link redirects `/s/*` and QR scans `/api/qr/*` |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `guest` \| `demo` | registered once the app shell knows the user |

Short-link redirects (`/s/<code>`) and QR scans are server-side 302s with no page, so they send no PostHog events today;
their counts live in the product's own click stats. They are classed `app` so anything captured there later lands correctly.

## Identity
`components/AppShell.tsx` identifies signed-in users by Firebase uid (`account_type: "firebase"`). Guests and the demo
account are never identified; only `account_type` is registered. Sign-out sends `app_signed_out`, then `reset()` (which
re-registers the super properties) before the logout form posts.

## Events
| event | properties | where |
| --- | --- | --- |
| `landing_cta_clicked` | `target` (`shorten_link`, `shorten_qr`, `add_tracking`) | `components/ShortenBox.tsx` (landing hero) |
| `app_signed_up` | `method` (`password`) | `components/useAuth.ts` |
| `app_signed_in` | `method` (`password`, `google`) | `components/useAuth.ts` |
| `app_signed_out` | | `components/AppShell.tsx` |
| `app_link_created` | `entry_point` (`form`, `home`), `custom_back_half`, `has_tags`, `has_campaign`, `has_expiry`, `has_utm`, `with_qr` | `CreateLink.tsx`, `HomeDash.tsx` |
| `app_link_updated` | `fields` (count of changed keys), `bulk`, `count` | `LinkDetails.tsx`, `LinksApp.tsx` |
| `app_links_deleted` | `count` | `LinkDetails.tsx`, `LinksApp.tsx` |
| `app_qr_created` | `from_link`, `styled` | `QrNew.tsx` |
| `app_qr_downloaded` | `format` (`png`, `svg`, `jpeg`) | `QrDesigner.tsx` (`downloadQr`) |
| `app_page_created` | | `PagesList.tsx` |
| `app_page_published` | `published` (false = unpublished), `blocks` (count) | `PageEditor.tsx` |
| `app_campaign_created` | `has_utm` | `Campaigns.tsx` |
| `app_domain_added` | | `Domains.tsx` |
| `app_api_token_created` | | `Settings.tsx` |

Rules:
- Names are `app_<object>_<action>` / `landing_<object>_<action>`, snake_case, past tense, never containing the product name.
- Properties are kinds, counts, ids and booleans only. Never URLs, titles, back-halves, tags, domains, emails or token names.
- Adding an event = add it to `lib/telemetry/taxonomy.ts` (the only place names are defined) and this table. `tests/unit/telemetry.test.ts` rejects names outside `app_` / `landing_` and names containing the product.

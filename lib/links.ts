// Pure helpers for short links: validation, code generation, click classification and stats summaries.
export type Stats = { clicks: number; scans: number; bots: number; daily: Record<string, number>; dailyScans: Record<string, number>; referrers: Record<string, number>; devices: Record<string, number>; browsers: Record<string, number>; countries: Record<string, number>; cities: Record<string, number> };
/** A short link. `hidden` mirrors Bitly's "hide link" (still redirects, left out of lists); `tags`/`campaignId` organise the list; `utm` is the builder's state. */
export type Link = { code: string; ownerId: string; url: string; title: string; createdAt: string; expiresAt: string | null; disabled: boolean; hidden: boolean; tags: string[]; campaignId: string | null; qrId: string | null; stats: Stats };
export const LIMITS = { perUser: 300, url: 2048, title: 100, code: 40, bucket: 60, tag: 30, tagsPerLink: 10 };
const RESERVED = new Set(["app", "api", "login", "s", "p", "qr", "admin", "links", "new", "pricing", "help", "developers"]);
export const emptyStats = (): Stats => ({ clicks: 0, scans: 0, bots: 0, daily: {}, dailyScans: {}, referrers: {}, devices: {}, browsers: {}, countries: {}, cities: {} });
/** Older docs predate tags/hidden/scans/locations: fill the gaps so every reader sees one shape. */
export function normalizeLink(l: Partial<Link> & { code: string; ownerId: string; url: string }): Link {
  const st = { ...emptyStats(), ...(l.stats ?? {}) };
  return { title: "", createdAt: new Date(0).toISOString(), expiresAt: null, disabled: false, hidden: false, tags: [], campaignId: null, qrId: null, ...l, stats: st };
}
export function cleanTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const out: string[] = []; for (const t of tags) { const v = String(t).trim().replace(/\s+/g, " ").slice(0, LIMITS.tag); if (v && !out.some(o => o.toLowerCase() === v.toLowerCase())) out.push(v); if (out.length >= LIMITS.tagsPerLink) break; }
  return out;
}

const PRIVATE_V4 = [/^127\./, /^10\./, /^192\.168\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^0\./];
/** A destination we are willing to redirect to: http(s), a real hostname, not localhost/private IPs, and not another IsDead short link. */
export function validateTarget(raw: string, ownHosts: string[] = []): { url?: string; error?: string } {
  let s = raw.trim(); if (!s) return { error: "Paste a link first." }; if (s.length > LIMITS.url) return { error: "That link is too long." };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) { if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^[^/]+:\d+/.test(s)) return { error: "Only http and https links can be shortened." }; s = "https://" + s; }
  let u: URL; try { u = new URL(s); } catch { return { error: "That doesn't look like a valid link." }; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return { error: "Only http and https links can be shortened." };
  const h = u.hostname.toLowerCase();
  if (u.username || u.password) return { error: "Links with a username or password aren't allowed." };
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || (h.includes(":")) || PRIVATE_V4.some(r => r.test(h))) return { error: "That address isn't reachable from the public internet." };
  if (!h.includes(".") && !/^\[/.test(h)) return { error: "That doesn't look like a valid link." };
  if (ownHosts.some(o => h === o.toLowerCase()) && /\/s\//.test(u.pathname)) return { error: "That's already a short link." };
  return { url: u.toString() };
}
export function validateBackHalf(s: string): string | null {
  if (!/^[A-Za-z0-9_-]{3,40}$/.test(s)) return "Use 3-40 letters, numbers, dashes or underscores.";
  if (RESERVED.has(s.toLowerCase())) return "That back-half is reserved."; return null;
}
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function genCode(len = 6, rnd: (n: number) => number = n => Math.floor(Math.random() * n)): string { let s = ""; for (let i = 0; i < len; i++) s += ALPHABET[rnd(ALPHABET.length)]; return s; }

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget|python-requests|headless|monitor|lighthouse|go-http-client|okhttp\/.*bot/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);
export function device(ua: string): "mobile" | "tablet" | "desktop" { if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet"; if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile"; return "desktop"; }
export function browser(ua: string): string { if (/edg\//i.test(ua)) return "Edge"; if (/opr\/|opera/i.test(ua)) return "Opera"; if (/firefox|fxios/i.test(ua)) return "Firefox"; if (/chrome|crios/i.test(ua)) return "Chrome"; if (/safari/i.test(ua)) return "Safari"; return "Other"; }
export function refHost(ref: string | null | undefined, ownHost?: string): string { if (!ref) return "Direct"; try { const h = new URL(ref).hostname.replace(/^www\./, ""); return h === ownHost ? "Direct" : h || "Direct"; } catch { return "Direct"; } }
export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const inc = (m: Record<string, number>, k: string) => { if (k in m) m[k]!++; else if (Object.keys(m).length < LIMITS.bucket) m[k] = 1; else m["Other"] = (m["Other"] ?? 0) + 1; };

/** Record one visit. Bots are counted separately so they never inflate clicks; QR scans are counted apart from clicks (Bitly's "engagements" = both). */
export function recordVisit(st: Stats, v: { ua: string; referer?: string | null; ownHost?: string; now?: Date; scan?: boolean; country?: string | null; city?: string | null }): void {
  if (isBot(v.ua)) { st.bots++; return; }
  if (v.scan) { st.scans = (st.scans ?? 0) + 1; inc(st.dailyScans ??= {}, dayKey(v.now)); } else { st.clicks++; inc(st.daily, dayKey(v.now)); }
  inc(st.referrers, v.scan ? "QR Code" : refHost(v.referer, v.ownHost)); inc(st.devices, device(v.ua)); inc(st.browsers, browser(v.ua));
  const co = (v.country ?? "").trim().toUpperCase(); inc(st.countries ??= {}, /^[A-Z]{2}$/.test(co) ? co : "Unknown");
  const ci = (v.city ?? "").trim(); inc(st.cities ??= {}, ci ? `${ci}, ${co || "??"}` : "Unknown");
}
export const top = (m: Record<string, number>, n = 6) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));
export function series(st: Stats, days = 30, now = new Date()) { const out: { day: string; count: number; scans: number }[] = []; for (let i = days - 1; i >= 0; i--) { const d = dayKey(new Date(now.getTime() - i * 864e5)); out.push({ day: d, count: st.daily[d] ?? 0, scans: st.dailyScans?.[d] ?? 0 }); } return out; }
/** Sum of a daily bucket over the last `days` days (today inclusive). */
export const sumDays = (m: Record<string, number> | undefined, days: number, now = new Date()) => { let n = 0; for (let i = 0; i < days; i++) n += m?.[dayKey(new Date(now.getTime() - i * 864e5))] ?? 0; return n; };
export const plural = (n: number, one: string, many = one + "s") => `${n.toLocaleString()} ${n === 1 ? one : many}`;
export const isLive = (l: Pick<Link, "disabled" | "expiresAt">, now = new Date()) => !l.disabled && (!l.expiresAt || new Date(l.expiresAt).getTime() > now.getTime());
export const hostOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

export function demoLinks(ownerId: string): Link[] {
  const mk = (code: string, url: string, title: string, clicks: number, ref: Record<string, number>, ageDays: number, tags: string[] = []): Link => { const st = emptyStats(); st.clicks = clicks; st.bots = Math.round(clicks * 0.06); st.referrers = ref;
    st.devices = { mobile: Math.round(clicks * 0.58), desktop: Math.round(clicks * 0.36), tablet: clicks - Math.round(clicks * 0.58) - Math.round(clicks * 0.36) }; st.browsers = { Chrome: Math.round(clicks * 0.5), Safari: Math.round(clicks * 0.34), Firefox: Math.round(clicks * 0.1), Edge: clicks - Math.round(clicks * 0.94) };
    const w = [0.02, 0.03, 0.05, 0.04, 0.03, 0.06, 0.08, 0.05, 0.04, 0.03, 0.05, 0.07, 0.09, 0.12, 0.08, 0.06, 0.04, 0.02, 0.03, 0.05, 0.07, 0.1, 0.12, 0.09, 0.05, 0.04, 0.06, 0.08, 0.11, 0.14]; const tot = w.reduce((a, b) => a + b, 0); w.forEach((x, i) => { st.daily[dayKey(new Date(Date.now() - (29 - i) * 864e5))] = Math.round((x / tot) * clicks); });
    st.countries = { US: Math.round(clicks * 0.62), GB: Math.round(clicks * 0.14), CA: Math.round(clicks * 0.09), DE: Math.round(clicks * 0.06), Unknown: clicks - Math.round(clicks * 0.62) - Math.round(clicks * 0.14) - Math.round(clicks * 0.09) - Math.round(clicks * 0.06) };
    st.cities = { "New York, US": Math.round(clicks * 0.2), "London, GB": Math.round(clicks * 0.12), "San Francisco, US": Math.round(clicks * 0.1), "Toronto, CA": Math.round(clicks * 0.07), "Berlin, DE": Math.round(clicks * 0.05), Unknown: Math.round(clicks * 0.46) };
    return normalizeLink({ code, ownerId, url, title, createdAt: new Date(Date.now() - ageDays * 864e5).toISOString(), expiresAt: null, disabled: false, hidden: false, tags, campaignId: null, qrId: null, stats: st }); };
  return [
    mk("launch26", "https://example.com/blog/our-2026-launch-announcement?utm_source=newsletter&utm_medium=email", "Launch announcement", 1284, { "newsletter.example": 610, Direct: 322, "x.com": 188, "news.ycombinator.com": 120, "linkedin.com": 44 }, 21, ["launch", "newsletter"]),
    mk("docs-start", "https://example.com/docs/getting-started", "Docs: getting started", 642, { Direct: 288, "google.com": 211, "github.com": 143 }, 40, ["docs"]),
    mk("Zq7Km2", "https://example.com/events/spring-workshop-registration", "Spring workshop", 238, { "instagram.com": 130, Direct: 70, "facebook.com": 38 }, 9, ["events", "social"]),
    mk("press-kit", "https://example.com/press/kit.zip", "Press kit", 57, { Direct: 40, "example.org": 17 }, 4),
  ];
}

// Aggregate click/scan stats across a set of links (campaigns, the global Analytics page).
import { dayKey, top, type Link } from "@/lib/links";
export type Agg = { clicks: number; scans: number; series: { day: string; clicks: number; scans: number }[]; referrers: { name: string; count: number }[]; devices: { name: string; count: number }[]; browsers: { name: string; count: number }[]; countries: { name: string; count: number }[]; cities: { name: string; count: number }[]; topLinks: { code: string; title: string; url: string; clicks: number; scans: number }[] };
const merge = (into: Record<string, number>, from: Record<string, number> | undefined) => { for (const [k, v] of Object.entries(from ?? {})) into[k] = (into[k] ?? 0) + v; };
/** Totals over the last `days` days (daily buckets); breakdowns are all-time per link since those aren't bucketed by day. */
export function aggregate(links: Link[], days = 30, now = new Date()): Agg {
  const series: Agg["series"] = []; for (let i = days - 1; i >= 0; i--) { const d = dayKey(new Date(now.getTime() - i * 864e5)); let c = 0, s = 0; for (const l of links) { c += l.stats.daily[d] ?? 0; s += l.stats.dailyScans?.[d] ?? 0; } series.push({ day: d, clicks: c, scans: s }); }
  const r: Record<string, number> = {}, dv: Record<string, number> = {}, br: Record<string, number> = {}, co: Record<string, number> = {}, ci: Record<string, number> = {};
  for (const l of links) { merge(r, l.stats.referrers); merge(dv, l.stats.devices); merge(br, l.stats.browsers); merge(co, l.stats.countries); merge(ci, l.stats.cities); }
  const inRange = (l: Link) => { let c = 0, s = 0; for (const x of series) { c += l.stats.daily[x.day] ?? 0; s += l.stats.dailyScans?.[x.day] ?? 0; } return { c, s }; };
  const topLinks = links.map(l => { const { c, s } = inRange(l); return { code: l.code, title: l.title, url: l.url, clicks: c, scans: s }; }).filter(t => t.clicks + t.scans > 0).sort((a, b) => b.clicks + b.scans - a.clicks - a.scans).slice(0, 10);
  return { clicks: series.reduce((n, x) => n + x.clicks, 0), scans: series.reduce((n, x) => n + x.scans, 0), series, referrers: top(r, 8), devices: top(dv, 4), browsers: top(br, 6), countries: top(co, 8), cities: top(ci, 8), topLinks };
}

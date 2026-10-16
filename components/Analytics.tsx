"use client";
// Global Analytics (Bitly's Analytics tab): date range, engagements over time, top links, referrers, devices, browsers, locations.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bars } from "@/components/LinkDetails";
import { hostOf, plural } from "@/lib/links";
import type { Agg } from "@/lib/analytics";
const RANGES = [["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]] as const;
export function Analytics({ agg, days, linkCount, from, to }: { agg: Agg; days: number; linkCount: number; from?: string; to?: string }) {
  const r = useRouter(); const sp = useSearchParams(); const custom = !!(from || to);
  const set = (k: string, v: string) => { const u = new URLSearchParams(sp.toString()); if (v) u.set(k, v); else u.delete(k); if (k === "days") { u.delete("from"); u.delete("to"); } r.push(`/app/analytics?${u}`); };
  const tot = agg.clicks + agg.scans; const max = Math.max(1, ...agg.series.map(x => x.clicks + x.scans)); const first = agg.series[0]?.day ?? "", last = agg.series[agg.series.length - 1]?.day ?? "";
  const csv = () => { const rows = [["day", "clicks", "scans"], ...agg.series.map(x => [x.day, x.clicks, x.scans])]; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" })); a.download = `bitlyisdead-analytics-${first}-${last}.csv`; a.click(); };
  return <main className="bl-app bl-home">
    <div className="bl-head"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>Analytics <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(linkCount, "link")}</span></h1>
      <div className="bl-tools" style={{ gap: 6 }}><label className="bl-sel">Date range <select aria-label="Date range" className="ids-input" value={custom ? "custom" : String(days)} onChange={e => e.target.value === "custom" ? set("from", first) : set("days", e.target.value)}>{RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}<option value="custom">Custom…</option></select></label>
        {custom && <><input aria-label="From date" type="date" className="ids-input" value={from ?? ""} max={to || undefined} onChange={e => set("from", e.target.value)} /><input aria-label="To date" type="date" className="ids-input" value={to ?? ""} min={from || undefined} onChange={e => set("to", e.target.value)} /></>}
        <button type="button" className="iconbtn" onClick={csv}>Export CSV</button></div></div>
    <div className="an-kpis"><div className="ids-card bl-panel"><span className="ids-muted">Engagements</span><b data-testid="an-total">{tot.toLocaleString()}</b></div><div className="ids-card bl-panel"><span className="ids-muted">Clicks</span><b>{agg.clicks.toLocaleString()}</b></div><div className="ids-card bl-panel"><span className="ids-muted">Scans</span><b>{agg.scans.toLocaleString()}</b></div><div className="ids-card bl-panel"><span className="ids-muted">Top referrer</span><b style={{ fontSize: 18 }}>{agg.referrers[0]?.name ?? "—"}</b></div></div>
    <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 12 }}>Engagements over time <span className="ids-muted" style={{ fontWeight: 500, fontSize: 13 }}>· {first} to {last}</span></h3><div className="bl-chart" role="img" aria-label="Clicks and scans per day">{agg.series.map(x => <div key={x.day} title={`${x.day}: ${x.clicks} clicks, ${x.scans} scans`}><i style={{ height: `${((x.clicks + x.scans) / max) * 100}%` }} /></div>)}</div><div className="bl-chart__ax"><span>{first.slice(5)}</span><span>{last.slice(5)}</span></div></section>
    <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 8 }}>Top performing links</h3>{agg.topLinks.length === 0 ? <p className="ids-muted" style={{ margin: 0 }}>No engagements in this range yet.</p> : <table className="an-tbl" data-testid="an-top"><thead><tr><th>Link</th><th>Short link</th><th>Clicks</th><th>Scans</th></tr></thead><tbody>{agg.topLinks.map(t => <tr key={t.code}><td><Link href={`/app/l/${t.code}`}>{t.title || hostOf(t.url)}</Link></td><td className="ids-muted">/s/{t.code}</td><td>{t.clicks.toLocaleString()}</td><td>{t.scans.toLocaleString()}</td></tr>)}</tbody></table>}</section>
    <div className="bl-grid"><Bars title="Top referrers" rows={agg.referrers} total={tot} /><Bars title="Devices" rows={agg.devices} total={tot} /><Bars title="Browsers" rows={agg.browsers} total={tot} /><Bars title="Countries" rows={agg.countries} total={tot} /><Bars title="Cities" rows={agg.cities} total={tot} /></div>
    <p className="ids-muted" style={{ fontSize: 12, margin: 0 }}>Locations come from the country and city your hosting platform attaches to each request; the visitor's IP address is never stored. Bots and link previews are counted separately and excluded here. Referrer, device, browser and location breakdowns are all-time per link.</p>
  </main>;
}

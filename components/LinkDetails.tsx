"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { BP } from "@/lib/basepath";
import { CopyButton, shortUrl, useOrigin } from "@/components/LinksApp";
import { isLive, series, top, hostOf, type Link as L } from "@/lib/links";
const Bars = ({ title, rows, total }: { title: string; rows: { name: string; count: number }[]; total: number }) => <div className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 12 }}>{title}</h3>
  {rows.length === 0 ? <p className="ids-muted">No data yet.</p> : rows.map(r => <div key={r.name} className="bl-bar"><span>{r.name}</span><div><i style={{ width: `${Math.max(3, (r.count / Math.max(1, total)) * 100)}%` }} /></div><b>{r.count}</b></div>)}</div>;
export function LinkDetails({ initial }: { initial: L }) {
  const origin = useOrigin(); const r = useRouter(); const [l, setL] = useState(initial); const [url, setUrl] = useState(initial.url); const [title, setTitle] = useState(initial.title); const [msg, setMsg] = useState("");
  const s = series(l.stats, 30); const max = Math.max(1, ...s.map(x => x.count)); const full = `${origin}${BP}/s/${l.code}`;
  const patch = async (body: object) => { setMsg(""); const res = await fetch(`${BP}/api/links/${l.code}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const j = await res.json().catch(() => ({})); if (!res.ok) return setMsg(j.error ?? "Could not save."); setL(j.link); setUrl(j.link.url); setMsg("Saved"); };
  const del = async () => { if (!confirm("Delete this short link?")) return; if ((await fetch(`${BP}/api/links/${l.code}`, { method: "DELETE" })).ok) { r.push("/app"); r.refresh(); } };
  return <main className="bl-app"><p><Link href="/app">← All links</Link></p>
    <section className="ids-card bl-det"><div><h1 className="ids-h2" style={{ fontSize: 28 }}>{l.title || hostOf(l.url)}</h1>
      <p style={{ margin: "8px 0" }}><a className="bl-row__s" href={`${BP}/s/${l.code}`} target="_blank" rel="noreferrer" data-testid="short-url">{shortUrl(origin, l.code)}</a> <CopyButton text={full} /></p>
      <p className="ids-muted bl-row__u">{l.url}</p>
      <div className="bl-big"><div><b data-testid="total-clicks">{l.stats.clicks.toLocaleString()}</b><span className="ids-muted">clicks</span></div><div><b>{l.stats.bots}</b><span className="ids-muted">bot visits (not counted)</span></div><div><b>{isLive(l) ? "Live" : l.disabled ? "Off" : "Expired"}</b><span className="ids-muted">status</span></div></div></div>
      <div className="bl-qr"><img src={`${BP}/api/qr/${l.code}`} alt={`QR code for ${l.code}`} width={160} height={160} /><div className="tb"><a className="iconbtn" href={`${BP}/api/qr/${l.code}?format=png&download=1`}>PNG</a><a className="iconbtn" href={`${BP}/api/qr/${l.code}?download=1`}>SVG</a></div></div></section>
    <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 12 }}>Clicks, last 30 days</h3><div className="bl-chart" role="img" aria-label="Clicks per day">{s.map(x => <div key={x.day} title={`${x.day}: ${x.count}`}><i style={{ height: `${(x.count / max) * 100}%` }} /></div>)}</div><div className="bl-chart__ax"><span>{s[0]!.day.slice(5)}</span><span>{s[29]!.day.slice(5)}</span></div></section>
    <div className="bl-grid"><Bars title="Top referrers" rows={top(l.stats.referrers)} total={l.stats.clicks} /><Bars title="Devices" rows={top(l.stats.devices)} total={l.stats.clicks} /><Bars title="Browsers" rows={top(l.stats.browsers)} total={l.stats.clicks} /></div>
    <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 12 }}>Edit</h3>
      <label className="ids-label" htmlFor="d-url" style={{ marginTop: 0 }}>Destination</label><input id="d-url" className="ids-input" value={url} onChange={e => setUrl(e.target.value)} />
      <label className="ids-label" htmlFor="d-title">Title</label><input id="d-title" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} />
      <label className="ids-label" htmlFor="d-exp">Expires</label><input id="d-exp" type="date" className="ids-input" value={l.expiresAt ? l.expiresAt.slice(0, 10) : ""} onChange={e => patch({ expiresAt: e.target.value ? new Date(e.target.value + "T23:59:59").toISOString() : null })} />
      <div className="tb" style={{ marginTop: 16 }}><button className="ids-btn ids-btn--primary" onClick={() => patch({ url, title })}>Save changes</button><button className="ids-btn ids-btn--outline" onClick={() => patch({ disabled: !l.disabled })}>{l.disabled ? "Turn on" : "Turn off"}</button><button className="ids-btn ids-btn--outline" style={{ color: "var(--ids-color-danger)" }} onClick={del}>Delete</button><span role="status" className="ids-muted">{msg}</span></div></section>
  </main>;
}

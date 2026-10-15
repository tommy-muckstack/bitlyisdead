"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { Confirm } from "@/components/Modal";
import { QrDesigner, QrPreview, downloadQr } from "@/components/QrDesigner";
import { Bars } from "@/components/LinkDetails";
import { CopyButton, shortUrl, useOrigin } from "@/components/LinksApp";
import { series, top, plural, hostOf, type Link as L } from "@/lib/links";
import type { QrDoc } from "@/lib/qrstore";
import type { QrStyle } from "@/lib/qr";
export function QrDetail({ initial, link }: { initial: QrDoc; link: L }) {
  const origin = useOrigin(); const r = useRouter(); const created = useSearchParams().get("created") === "1"; const [q, setQ] = useState(initial); const [style, setStyle] = useState<QrStyle>(initial.style); const [title, setTitle] = useState(initial.title); const [edit, setEdit] = useState(false); const [msg, setMsg] = useState(""); const [ask, setAsk] = useState(false);
  const data = `${origin}${BP}/s/${q.code}?r=qr`; const s = series(link.stats, 30); const max = Math.max(1, ...s.map(x => x.scans)); const scans = link.stats.scans ?? 0;
  const save = async () => { setMsg(""); const res = await fetch(`${BP}/api/qrcodes/${q.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, style }) }); if (!res.ok) return setMsg("Could not save."); setQ((await res.json()).qr); setEdit(false); setMsg("Saved"); r.refresh(); };
  const del = async () => { if ((await fetch(`${BP}/api/qrcodes/${q.id}`, { method: "DELETE" })).ok) { r.push("/app/qr"); r.refresh(); } };
  return <main className="bl-app"><p><Link href="/app/qr">← QR Codes</Link></p>
    {created && <div className="bl-fresh" role="status">Your QR Code is ready. Download it below and test it with your phone before printing.</div>}
    <section className="ids-card bl-det"><div><h1 className="ids-h2" style={{ fontSize: 28 }}>{q.title || hostOf(link.url)}</h1>
      <p style={{ margin: "8px 0" }}>Scans open <a className="bl-row__s" href={`${BP}/s/${q.code}`} target="_blank" rel="noreferrer">{shortUrl(origin, q.code)}</a> <CopyButton text={`${origin}${BP}/s/${q.code}`} /> → <Link href={`/app/l/${q.code}`}>link details</Link></p><p className="ids-muted bl-row__u">{link.url}</p>
      <div className="bl-big"><div><b data-testid="total-scans">{scans.toLocaleString()}</b><span className="ids-muted">{scans === 1 ? "scan" : "scans"}</span></div><div><b>{link.stats.clicks.toLocaleString()}</b><span className="ids-muted">link clicks</span></div><div><b>{link.disabled ? "Off" : "Live"}</b><span className="ids-muted">status</span></div></div>
      <div className="tb" style={{ marginTop: 18 }}><button type="button" className="ids-btn ids-btn--primary" onClick={() => downloadQr(data, q.style, "png", q.title || q.code)}>Download PNG</button><button type="button" className="ids-btn ids-btn--outline" onClick={() => downloadQr(data, q.style, "svg", q.title || q.code)}>SVG</button><button type="button" className="ids-btn ids-btn--outline" onClick={() => downloadQr(data, q.style, "jpeg", q.title || q.code)}>JPEG</button><button type="button" className="ids-btn ids-btn--outline" onClick={() => setEdit(e => !e)}>{edit ? "Close designer" : "Customize"}</button><button type="button" className="ids-btn ids-btn--outline" style={{ color: "var(--ids-color-danger)" }} onClick={() => setAsk(true)}>Delete</button><span role="status" className="ids-muted">{msg}</span></div></div>
      <div className="bl-qr"><QrPreview data={data} style={q.style} size={200} testId="qr-image" /></div></section>
    {edit && <section className="ids-card bl-panel"><label className="ids-label" htmlFor="qd-title" style={{ marginTop: 0 }}>Title</label><input id="qd-title" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} style={{ maxWidth: 420, marginBottom: 16 }} /><QrDesigner data={data} style={style} onChange={setStyle} /><div className="bl-create__ft"><button type="button" className="ids-btn ids-btn--outline" onClick={() => { setStyle(q.style); setEdit(false); }}>Cancel</button><button type="button" className="ids-btn ids-btn--primary" onClick={save}>Save design</button></div></section>}
    <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 12 }}>Scans, last 30 days <span className="ids-muted" style={{ fontWeight: 500, fontSize: 13 }}>· {plural(s.reduce((n, x) => n + x.scans, 0), "scan")}</span></h3><div className="bl-chart" role="img" aria-label="Scans per day">{s.map(x => <div key={x.day} title={`${x.day}: ${x.scans} scans`}><i style={{ height: `${(x.scans / max) * 100}%` }} /></div>)}</div><div className="bl-chart__ax"><span>{s[0]!.day.slice(5)}</span><span>{s[29]!.day.slice(5)}</span></div></section>
    <div className="bl-grid"><Bars title="Devices" rows={top(link.stats.devices)} total={link.stats.clicks + scans} /><Bars title="Countries" rows={top(link.stats.countries ?? {})} total={link.stats.clicks + scans} /><Bars title="Cities" rows={top(link.stats.cities ?? {})} total={link.stats.clicks + scans} /></div>
    <Confirm open={ask} title="Delete this QR Code?" body={<p>The printed code will stop working. Its short link stays in your Links list. This can't be undone.</p>} onCancel={() => setAsk(false)} onConfirm={del} />
  </main>;
}

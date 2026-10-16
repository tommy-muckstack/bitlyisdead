"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BP } from "@/lib/basepath";
import { Confirm } from "@/components/Modal";
import { QrPreview, downloadQr } from "@/components/QrDesigner";
import { CopyButton, shortUrl, useOrigin } from "@/components/LinksApp";
import { plural, hostOf, type Link as L } from "@/lib/links";
import type { QrDoc } from "@/lib/qrstore";
type Row = QrDoc & { link: L | null };
export function QrList({ initial }: { initial: Row[] }) {
  const origin = useOrigin(); const r = useRouter(); const [rows, setRows] = useState(initial); const [q, setQ] = useState(""); const [view, setView] = useState<"active" | "hidden">("active"); const [sort, setSort] = useState<"newest" | "scans">("newest"); const [del, setDel] = useState<Row | null>(null);
  const shown = useMemo(() => rows.filter(x => (view === "hidden") === x.hidden).filter(x => !q.trim() || [x.title, x.code, x.link?.url ?? ""].join(" ").toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => sort === "scans" ? (b.link?.stats.scans ?? 0) - (a.link?.stats.scans ?? 0) : b.createdAt.localeCompare(a.createdAt)), [rows, q, view, sort]);
  const patch = async (x: Row, body: object) => { const res = await fetch(`${BP}/api/qrcodes/${x.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (res.ok) { const { qr } = await res.json(); setRows(rs => rs.map(y => y.id === x.id ? { ...y, ...qr } : y)); } };
  const remove = async (x: Row) => { setDel(null); if ((await fetch(`${BP}/api/qrcodes/${x.id}`, { method: "DELETE" })).ok) { setRows(rs => rs.filter(y => y.id !== x.id)); r.refresh(); } };
  const active = rows.filter(x => !x.hidden); const scans = active.reduce((n, x) => n + (x.link?.stats.scans ?? 0), 0);
  return <main className="bl-app bl-links">
    <div className="bl-head"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>QR Codes <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(active.length, "QR Code")} · {plural(scans, "scan")}</span></h1><Link href="/app/qr/new" className="ids-btn ids-btn--primary">Create QR Code</Link></div>
    <div className="bl-tools"><input className="ids-input bl-search" aria-label="Search QR Codes" placeholder="Search QR Codes" value={q} onChange={e => setQ(e.target.value)} /><span className="bl-grow" /><label className="bl-sel">Sort <select aria-label="Sort" className="ids-input" value={sort} onChange={e => setSort(e.target.value as typeof sort)}><option value="newest">Newest first</option><option value="scans">Most scans</option></select></label><label className="bl-sel"><select aria-label="Show active or hidden QR Codes" className="ids-input" value={view} onChange={e => setView(e.target.value as typeof view)}><option value="active">Active</option><option value="hidden">Hidden</option></select></label></div>
    <ul className="bl-list" data-testid="qrcodes">{shown.map(x => <li key={x.id} className="ids-card bl-row qr-row" data-id={x.id}>
      <Link href={`/app/qr/${x.id}`} className="qr-row__img" aria-label={`Open ${x.title || x.code}`}><QrPreview data={`${origin}${BP}/s/${x.code}?r=qr`} style={x.style} size={96} /></Link>
      <div className="bl-row__main"><Link className="bl-row__t" href={`/app/qr/${x.id}`}>{x.title || (x.link ? hostOf(x.link.url) : x.code)}</Link><a className="bl-row__s" href={`${BP}/s/${x.code}`} target="_blank" rel="noreferrer">{shortUrl(origin, x.code)}</a><div className="bl-row__u">{x.link?.url ?? ""}</div><div className="bl-row__meta"><span>{new Date(x.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>{x.hidden && <span className="ids-pill">Hidden</span>}</div></div>
      <div className="bl-row__stat"><b>{(x.link?.stats.scans ?? 0).toLocaleString()}</b><span className="ids-muted">{x.link?.stats.scans === 1 ? "scan" : "scans"}</span></div>
      <div className="bl-row__act"><button type="button" className="iconbtn" onClick={() => downloadQr(`${origin}${BP}/s/${x.code}?r=qr`, x.style, "png", x.title || x.code)}>Download PNG</button><CopyButton text={`${origin}${BP}/s/${x.code}`} label="Copy link" /><Link className="iconbtn" href={`/app/qr/${x.id}`}>Customize</Link><button type="button" className="iconbtn" onClick={() => patch(x, { hidden: !x.hidden })}>{x.hidden ? "Show" : "Hide"}</button><button type="button" className="iconbtn" aria-label={`Delete ${x.title || x.code}`} onClick={() => setDel(x)}>Delete</button></div></li>)}
      {shown.length === 0 && <li className="ids-card bl-empty">{rows.length === 0 ? <>No QR Codes yet. <Link href="/app/qr/new">Create your first QR Code</Link>.</> : "No QR Codes match."}</li>}</ul>
    <Confirm open={!!del} title="Delete this QR Code?" body={<p>The printed code will stop working. Its short link stays in your Links list. This can't be undone.</p>} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
  </main>;
}

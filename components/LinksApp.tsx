"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BP } from "@/lib/basepath";
import { hostOf, isLive, plural, type Link as L } from "@/lib/links";
export const useOrigin = () => { const [o, setO] = useState(""); useEffect(() => setO(location.origin), []); return o; };
export const shortUrl = (origin: string, code: string) => `${origin.replace(/^https?:\/\//, "")}${BP}/s/${code}`;
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return <button className="iconbtn" onClick={async () => { try { await navigator.clipboard.writeText(text); } catch { /* ignore */ } setOk(true); setTimeout(() => setOk(false), 1400); }}>{ok ? "Copied!" : label}</button>;
}
export function LinksApp({ initial, prefill, query }: { initial: L[]; prefill?: string; query?: string }) {
  const origin = useOrigin(); const [links, setLinks] = useState(initial); const [url, setUrl] = useState(prefill ?? ""); const [title, setTitle] = useState(""); const [back, setBack] = useState(""); const [exp, setExp] = useState(""); const [more, setMore] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [q, setQ] = useState(query ?? ""); const [fresh, setFresh] = useState<string | null>(null);
  useEffect(() => { if (prefill) document.getElementById("url")?.focus(); }, [prefill]);
  const create = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch(`${BP}/api/links`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, title, backHalf: back, expiresAt: exp ? new Date(exp + "T23:59:59").toISOString() : null }) }); const j = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Something went wrong."); setLinks(l => [j.link, ...l]); setFresh(j.link.code); setUrl(""); setTitle(""); setBack(""); setExp(""); };
  const patch = async (code: string, body: object) => { const r = await fetch(`${BP}/api/links/${code}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (r.ok) { const { link } = await r.json(); setLinks(ls => ls.map(x => x.code === code ? link : x)); } };
  const del = async (code: string) => { if (!confirm("Delete this short link? Anyone who has it will get an error.")) return; const r = await fetch(`${BP}/api/links/${code}`, { method: "DELETE" }); if (r.ok) setLinks(ls => ls.filter(x => x.code !== code)); };
  const shown = useMemo(() => links.filter(l => !q.trim() || [l.title, l.url, l.code, ...l.tags].join(" ").toLowerCase().includes(q.trim().toLowerCase())), [links, q]);
  const total = links.reduce((n, l) => n + l.stats.clicks, 0);
  return <main className="bl-app">
    <section className="ids-card bl-new"><h1 className="ids-h3" style={{ marginBottom: 12 }}>Shorten a link</h1>
      <form onSubmit={create}><div className="bl-new__row"><input id="url" className="ids-input" aria-label="Destination URL" placeholder="Paste a long link, e.g. https://example.com/very/long/page?utm=123" value={url} onChange={e => setUrl(e.target.value)} inputMode="url" autoComplete="off" /><button className="ids-btn ids-btn--primary" disabled={busy || !url.trim()}>{busy ? "Shortening…" : "Shorten"}</button></div>
        <button type="button" className="bl-more" onClick={() => setMore(m => !m)} aria-expanded={more}>{more ? "− Fewer options" : "+ Title, custom back-half, expiry"}</button>
        {more && <div className="bl-opts"><div><label className="ids-label" htmlFor="title">Title</label><input id="title" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} placeholder="Optional" /></div>
          <div><label className="ids-label" htmlFor="back">Custom back-half</label><div className="bl-back"><span className="ids-muted">…{BP}/s/</span><input id="back" className="ids-input" value={back} maxLength={40} onChange={e => setBack(e.target.value)} placeholder="my-launch" /></div></div>
          <div><label className="ids-label" htmlFor="exp">Expires</label><input id="exp" type="date" className="ids-input" value={exp} onChange={e => setExp(e.target.value)} /></div></div>}
        {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "10px 0 0" }}>{err}</p>}</form>
      {fresh && (() => { const l = links.find(x => x.code === fresh); return l && <div className="bl-fresh" data-testid="fresh"><span>Your short link is ready:</span> <b data-testid="fresh-url">{shortUrl(origin, l.code)}</b> <CopyButton text={`${origin}${BP}/s/${l.code}`} /></div>; })()}
    </section>
    <div className="bl-head"><h2 className="ids-h3">Your links <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(links.length, "link")} · {plural(total, "click")}</span></h2><input className="ids-input bl-search" aria-label="Search links" placeholder="Search links" value={q} onChange={e => setQ(e.target.value)} /></div>
    <ul className="bl-list" data-testid="links">{shown.map(l => <li key={l.code} className={"ids-card bl-row" + (isLive(l) ? "" : " off")} data-code={l.code}>
      <div className="bl-row__main"><Link className="bl-row__t" href={`/app/l/${l.code}`}>{l.title || hostOf(l.url)}</Link>
        <a className="bl-row__s" href={`${BP}/s/${l.code}`} target="_blank" rel="noreferrer">{shortUrl(origin, l.code)}</a><div className="bl-row__u" title={l.url}>{l.url}</div>
        {!isLive(l) && <span className="ids-pill" style={{ marginTop: 6 }}>{l.disabled ? "Turned off" : "Expired"}</span>}</div>
      <div className="bl-row__stat"><b>{l.stats.clicks.toLocaleString()}</b><span className="ids-muted">clicks</span></div>
      <div className="bl-row__act"><CopyButton text={`${origin}${BP}/s/${l.code}`} /><Link className="iconbtn" href={`/app/l/${l.code}`}>Details</Link>
        <button className="iconbtn" onClick={() => patch(l.code, { disabled: !l.disabled })}>{l.disabled ? "Turn on" : "Turn off"}</button><button className="iconbtn" aria-label={`Delete ${l.code}`} onClick={() => del(l.code)}>Delete</button></div></li>)}
      {shown.length === 0 && <li className="ids-card bl-empty">{links.length ? "No links match that search." : "No links yet. Paste one above."}</li>}</ul>
  </main>;
}

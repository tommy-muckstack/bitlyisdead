"use client";
// Bitly-style Home: quick create, a getting-started checklist, the last 7 days of engagement and your most recent links.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { CopyButton, shortUrl, useOrigin } from "@/components/LinksApp";
import { hostOf, plural, type Link as L } from "@/lib/links";
export function HomeDash({ links, prefill, name, extra, hasPage = false, useCase = "" }: { links: L[]; prefill?: string; name: string; extra?: React.ReactNode; hasPage?: boolean; useCase?: string }) {
  const origin = useOrigin(); const r = useRouter(); const [url, setUrl] = useState(prefill ?? ""); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [made, setMade] = useState<L | null>(null); const [tab, setTab] = useState<"link" | "qr">("link");
  const create = async (e: React.FormEvent) => { e.preventDefault(); if (tab === "qr") { r.push(`/app/qr/new?url=${encodeURIComponent(url.trim())}`); return; } setBusy(true); setErr(""); const res = await fetch(`${BP}/api/links`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) }); const j = await res.json().catch(() => ({})); setBusy(false); if (!res.ok) return setErr(j.error ?? "Something went wrong."); setMade(j.link); setUrl(""); try { await navigator.clipboard.writeText(`${origin}${BP}/s/${j.link.code}`); } catch { /* clipboard blocked */ } r.refresh(); };
  const vis = links.filter(l => !l.hidden); const recent = vis.slice(0, 5);
  const days = Array.from({ length: 7 }, (_, i) => i); const agg = days.map(i => { const d = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10); let c = 0, s = 0; for (const l of vis) { c += l.stats.daily[d] ?? 0; s += l.stats.dailyScans?.[d] ?? 0; } return { d, c, s }; }); const tot = agg.reduce((n, x) => n + x.c + x.s, 0); const max = Math.max(1, ...agg.map(x => x.c + x.s));
  return <main className="bl-app bl-home">
    <h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>{name === "Guest" ? "Your connections platform" : `Welcome back, ${name}`}</h1>{useCase && vis.length === 0 && <p className="bl-fresh" style={{ margin: 0 }}>{useCase === "qr" ? <>Start with a QR Code: <Link href="/app/qr/new">design your first code</Link>.</> : useCase === "pages" ? <>Start with a page: <Link href="/app/pages/new">build your link-in-bio</Link>.</> : useCase === "marketing" ? <>Start with a campaign: <Link href="/app/campaigns/new">set shared UTMs</Link>, then create links inside it.</> : useCase === "api" ? <>Start with a token: <Link href="/app/settings/api">Settings → API</Link>, docs at <Link href="/developers">Developers</Link>.</> : <>Paste a destination below to make your first short link.</>}</p>}
    <section className="ids-card bl-new"><div className="bl-qc__tabs"><button type="button" className={tab === "link" ? "on" : ""} onClick={() => setTab("link")}>Short link</button><button type="button" className={tab === "qr" ? "on" : ""} onClick={() => setTab("qr")}>QR Code</button>{extra}</div>
      <h2 className="ids-h3" style={{ margin: "14px 0 4px" }}>Quick create</h2><p className="ids-muted" style={{ margin: "0 0 12px" }}>{tab === "qr" ? "Paste a destination, then design a QR Code for it." : "Paste a destination to get a short link in one step."} For a title, custom back-half, tags or UTMs use <Link href="/app/links/new">Create link</Link>.</p>
      <form onSubmit={create}><label className="ids-label" htmlFor="qc-url">Enter your destination URL</label><div className="bl-new__row"><input id="qc-url" className="ids-input" placeholder="https://example.com/my-long-url" value={url} onChange={e => setUrl(e.target.value)} inputMode="url" autoComplete="off" /><button className="ids-btn ids-btn--primary" disabled={busy || !url.trim()}>{busy ? "Creating…" : tab === "qr" ? "Design your QR Code" : "Create your link"}</button></div>
        {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "10px 0 0" }}>{err}</p>}</form>
      {made && <div className="bl-fresh" data-testid="fresh"><span>Your link is ready and copied:</span> <b data-testid="fresh-url">{shortUrl(origin, made.code)}</b> <CopyButton text={`${origin}${BP}/s/${made.code}`} /> <Link className="iconbtn" href={`/app/l/${made.code}`}>View link details</Link></div>}
    </section>
    <div className="bl-home__grid">
      <section className="ids-card bl-panel"><div className="bl-panel__hd"><h3 className="ids-h3" style={{ fontSize: 18 }}>Engagements, last 7 days</h3><b>{tot.toLocaleString()}</b></div>
        <div className="bl-chart bl-chart--sm" role="img" aria-label="Clicks and scans per day, last 7 days">{agg.map(x => <div key={x.d} title={`${x.d}: ${x.c} clicks, ${x.s} scans`}><i style={{ height: `${((x.c + x.s) / max) * 100}%` }} /></div>)}</div>
        <div className="bl-chart__ax"><span>{agg[0]!.d.slice(5)}</span><span>Today</span></div></section>
      <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 10 }}>Getting started</h3>
        <ul className="bl-todo"><li className={vis.length ? "done" : ""}><Link href="/app/links/new">Make a short link</Link></li><li className={vis.some(l => l.qrId) ? "done" : ""}><Link href="/app/qr/new">Create a QR Code</Link></li><li className={hasPage ? "done" : ""}><Link href="/app/pages">Build a link-in-bio page</Link></li><li className={vis.some(l => l.stats.clicks > 0) ? "done" : ""}><span>Share it and get your first click</span></li><li className={vis.some(l => l.title) ? "done" : ""}><Link href="/app/links">Give a link a title</Link></li></ul></section>
    </div>
    <section className="ids-card bl-panel"><div className="bl-panel__hd"><h3 className="ids-h3" style={{ fontSize: 18 }}>Recent links</h3><Link href="/app/links">View all links ({plural(vis.length, "link")}) →</Link></div>
      {recent.length === 0 ? <p className="ids-muted" style={{ margin: 0 }}>No links yet. Paste a destination above to make your first one.</p> : <ul className="bl-mini">{recent.map(l => <li key={l.code}><Link href={`/app/l/${l.code}`}>{l.title || hostOf(l.url)}</Link><span className="bl-row__s">{shortUrl(origin, l.code)}</span><b>{plural(l.stats.clicks, "click")}</b><CopyButton text={`${origin}${BP}/s/${l.code}`} /></li>)}</ul>}</section>
  </main>;
}

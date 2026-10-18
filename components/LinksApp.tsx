"use client";
// Links page (Bitly's /links): search, created-date / tag / type / expiration filters, Active|Hidden view, sort, bulk actions.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/telemetry";
import { Confirm, Modal } from "@/components/Modal";
import { TagInput } from "@/components/TagInput";
import { hostOf, isLive, plural, type Link as L } from "@/lib/links";
export const useOrigin = () => { const [o, setO] = useState(""); useEffect(() => setO(location.origin), []); return o; };
export const shortUrl = (origin: string, code: string) => `${origin.replace(/^https?:\/\//, "")}${BP}/s/${code}`;
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="iconbtn" onClick={async () => { try { await navigator.clipboard.writeText(text); } catch { /* ignore */ } setOk(true); setTimeout(() => setOk(false), 1400); }}>{ok ? "Copied!" : label}</button>;
}
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
type Sort = "newest" | "oldest" | "clicks"; type Range = "any" | "7" | "30" | "90" | "custom"; type Kind = "all" | "custom" | "random"; type Exp = "all" | "expired" | "expiring" | "none";
function Menu({ items }: { items: { label: string; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return <div className="bl-menu" ref={ref}><button type="button" className="iconbtn" aria-label="More actions" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>⋯</button>
    {open && <div role="menu" className="bl-menu__list">{items.map(it => <button type="button" role="menuitem" key={it.label} className={it.danger ? "danger" : ""} onClick={() => { setOpen(false); it.onClick(); }}>{it.label}</button>)}</div>}</div>;
}
export function LinksApp({ initial, query }: { initial: L[]; prefill?: string; query?: string }) {
  const origin = useOrigin(); const r = useRouter(); const [links, setLinks] = useState(initial); useEffect(() => setLinks(initial), [initial]);
  const [q, setQ] = useState(query ?? ""); const [view, setView] = useState<"active" | "hidden">("active"); const [sort, setSort] = useState<Sort>("newest");
  const [range, setRange] = useState<Range>("any"); const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [fTags, setFTags] = useState<string[]>([]); const [kind, setKind] = useState<Kind>("all"); const [exp, setExp] = useState<Exp>("all"); const [more, setMore] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set()); const [confirmDel, setConfirmDel] = useState<string[] | null>(null); const [tagFor, setTagFor] = useState<string[] | null>(null); const [tagDraft, setTagDraft] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  useEffect(() => { const u = new URL(location.href); if (q.trim()) u.searchParams.set("q", q.trim()); else u.searchParams.delete("q"); history.replaceState(null, "", u); }, [q]);
  const allTags = useMemo(() => Array.from(new Set(links.flatMap(l => l.tags))).sort(), [links]);
  const shown = useMemo(() => { const s = q.trim().toLowerCase(); const now = Date.now();
    const out = links.filter(l => (view === "hidden") === !!l.hidden)
      .filter(l => !s || [l.title, l.url, l.code, ...l.tags].join(" ").toLowerCase().includes(s))
      .filter(l => { if (range === "any") return true; const t = new Date(l.createdAt).getTime(); if (range === "custom") return (!from || t >= new Date(from).getTime()) && (!to || t <= new Date(to + "T23:59:59").getTime()); return t >= now - Number(range) * 864e5; })
      .filter(l => fTags.length === 0 || fTags.every(t => l.tags.some(x => x.toLowerCase() === t.toLowerCase())))
      .filter(l => kind === "all" || (kind === "custom") === l.custom)
      .filter(l => { if (exp === "all") return true; const e = l.expiresAt ? new Date(l.expiresAt).getTime() : null; if (exp === "none") return e === null; if (exp === "expired") return e !== null && e < now; return e !== null && e >= now && e < now + 7 * 864e5; });
    return out.sort((a, b) => sort === "clicks" ? b.stats.clicks - a.stats.clicks : sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)); }, [links, q, view, range, from, to, fTags, kind, exp, sort]);
  const filtered = range !== "any" || fTags.length > 0 || kind !== "all" || exp !== "all"; const clear = () => { setRange("any"); setFrom(""); setTo(""); setFTags([]); setKind("all"); setExp("all"); setQ(""); };
  const active = links.filter(l => !l.hidden); const total = active.reduce((n, l) => n + l.stats.clicks, 0);
  const apply = (updated: L[]) => setLinks(ls => ls.map(x => updated.find(u => u.code === x.code) ?? x));
  const patch = async (codes: string[], body: object) => { setBusy(true); const res = await fetch(`${BP}/api/links/bulk`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ codes, patch: body }) }); setBusy(false); if (res.ok) { track(EVENTS.app_link_updated, { fields: Object.keys(body).length, bulk: true, count: codes.length }); apply((await res.json()).links); setSel(new Set()); r.refresh(); } };
  const del = async (codes: string[]) => { setBusy(true); const res = await fetch(`${BP}/api/links/bulk`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ codes, delete: true }) }); setBusy(false); setConfirmDel(null); if (res.ok) { const { deleted } = await res.json(); track(EVENTS.app_links_deleted, { count: deleted.length }); setLinks(ls => ls.filter(x => !deleted.includes(x.code))); setSel(new Set()); r.refresh(); } };
  const toggle = (code: string) => setSel(s => { const n = new Set(s); if (n.has(code)) n.delete(code); else n.add(code); return n; }); const allSel = shown.length > 0 && shown.every(l => sel.has(l.code));
  return <main className="bl-app bl-links">
    <div className="bl-head"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>Links <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(active.length, "link")} · {plural(total, "click")}</span></h1><Link href="/app/links/new" className="ids-btn ids-btn--primary">Create link</Link></div>
    <div className="bl-tools">
      <input className="ids-input bl-search" aria-label="Search links" placeholder="Search links" value={q} onChange={e => setQ(e.target.value)} />
      <label className="bl-sel">Created <select aria-label="Filter by created date" className="ids-input" value={range} onChange={e => setRange(e.target.value as Range)}><option value="any">Any time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="custom">Custom range…</option></select></label>
      {range === "custom" && <><input aria-label="From date" type="date" className="ids-input" value={from} onChange={e => setFrom(e.target.value)} /><input aria-label="To date" type="date" className="ids-input" value={to} onChange={e => setTo(e.target.value)} /></>}
      <button type="button" className={"iconbtn" + (more || filtered ? " on" : "")} aria-expanded={more} onClick={() => setMore(m => !m)}>Add filters{filtered ? " •" : ""}</button>
      {filtered && <button type="button" className="bl-clear" onClick={clear}>Clear all filters</button>}
      <span className="bl-grow" />
      <label className="bl-sel">Sort <select aria-label="Sort" className="ids-input" value={sort} onChange={e => setSort(e.target.value as Sort)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="clicks">Most clicks</option></select></label>
      <label className="bl-sel"><select aria-label="Show active or hidden links" className="ids-input" value={view} onChange={e => { setView(e.target.value as typeof view); setSel(new Set()); }}><option value="active">Active</option><option value="hidden">Hidden</option></select></label>
    </div>
    {more && <div className="ids-card bl-filters"><div><label className="ids-label" htmlFor="f-tags">Tags</label><TagInput id="f-tags" value={fTags} onChange={setFTags} suggestions={allTags} placeholder="Filter by tag" /></div>
      <div><label className="ids-label" htmlFor="f-kind">Link type</label><select id="f-kind" className="ids-input" value={kind} onChange={e => setKind(e.target.value as Kind)}><option value="all">All links</option><option value="custom">With custom back-half</option><option value="random">Without custom back-half</option></select></div>
      <div><label className="ids-label" htmlFor="f-exp">Link expiration</label><select id="f-exp" className="ids-input" value={exp} onChange={e => setExp(e.target.value as Exp)}><option value="all">Any</option><option value="expiring">Expiring in 7 days</option><option value="expired">Expired</option><option value="none">No expiration date</option></select></div></div>}
    <div className="bl-bulk"><label><input type="checkbox" aria-label="Select all links" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(shown.map(l => l.code)))} /> {sel.size ? `${plural(sel.size, "link")} selected` : "Select all"}</label>
      {sel.size > 0 && <div className="tb"><button type="button" className="iconbtn" disabled={busy} onClick={() => patch([...sel], { hidden: view === "active" })}>{view === "active" ? "Hide" : "Unhide"}</button><button type="button" className="iconbtn" disabled={busy} onClick={() => { setTagDraft([]); setTagFor([...sel]); }}>Add tags</button><button type="button" className="iconbtn" disabled={busy} onClick={() => setConfirmDel([...sel])}>Delete</button></div>}</div>
    <ul className="bl-list" data-testid="links">{shown.map(l => <li key={l.code} className={"ids-card bl-row" + (isLive(l) ? "" : " off") + (sel.has(l.code) ? " sel" : "")} data-code={l.code}>
      <input type="checkbox" className="bl-row__cb" aria-label={`Select ${l.title || l.code}`} checked={sel.has(l.code)} onChange={() => toggle(l.code)} />
      <div className="bl-row__main"><Link className="bl-row__t" href={`/app/l/${l.code}`}>{l.title || hostOf(l.url)}</Link>
        <a className="bl-row__s" href={`${BP}/s/${l.code}`} target="_blank" rel="noreferrer">{shortUrl(origin, l.code)}</a><div className="bl-row__u" title={l.url}>{l.url}</div>
        <div className="bl-row__meta"><span>{fmtDate(l.createdAt)}</span>{l.tags.map(t => <button type="button" key={t} className="bl-tag" onClick={() => { setFTags(f => f.includes(t) ? f : [...f, t]); setMore(true); }}>{t}</button>)}{!isLive(l) && <span className="ids-pill">{l.disabled ? "Turned off" : "Expired"}</span>}{l.hidden && <span className="ids-pill">Hidden</span>}</div></div>
      <div className="bl-row__stat"><b>{l.stats.clicks.toLocaleString()}</b><span className="ids-muted">{l.stats.clicks === 1 ? "click" : "clicks"}</span></div>
      <div className="bl-row__act"><CopyButton text={`${origin}${BP}/s/${l.code}`} /><Link className="iconbtn" href={`/app/l/${l.code}`}>Edit</Link>
        <Menu items={[{ label: "View details", onClick: () => r.push(`/app/l/${l.code}`) }, { label: "Add tags", onClick: () => { setTagDraft(l.tags); setTagFor([l.code]); } }, { label: l.disabled ? "Turn on" : "Turn off", onClick: () => patch([l.code], { disabled: !l.disabled }) }, { label: l.hidden ? "Show link" : "Hide link", onClick: () => patch([l.code], { hidden: !l.hidden }) }, { label: "Delete", danger: true, onClick: () => setConfirmDel([l.code]) }]} /></div></li>)}
      {shown.length === 0 && <li className="ids-card bl-empty">{links.length === 0 ? <>No links yet. <Link href="/app/links/new">Create your first link</Link>.</> : view === "hidden" && !q && !filtered ? "No hidden links. Hide a link from its ⋯ menu to keep it out of the list without deleting it." : "No links match that search or filter."}</li>}</ul>
    <Confirm open={!!confirmDel} title={confirmDel && confirmDel.length > 1 ? `Delete ${plural(confirmDel.length, "link")}?` : "Delete this link?"} body={<p>Anyone who has the short link will see an error. This can't be undone. If you just want it out of the way, hide it instead.</p>} onCancel={() => setConfirmDel(null)} onConfirm={() => confirmDel && del(confirmDel)} />
    <Modal open={!!tagFor} title={tagFor && tagFor.length > 1 ? `Add tags to ${plural(tagFor.length, "link")}` : "Tags"} onClose={() => setTagFor(null)} actions={<><button type="button" className="ids-btn ids-btn--outline" onClick={() => setTagFor(null)}>Cancel</button><button type="button" className="ids-btn ids-btn--primary" data-autofocus disabled={busy} onClick={async () => { if (!tagFor) return; if (tagFor.length === 1) { setBusy(true); const res = await fetch(`${BP}/api/links/${tagFor[0]}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ tags: tagDraft }) }); setBusy(false); if (res.ok) apply([(await res.json()).link]); setTagFor(null); } else { await patch(tagFor, { addTags: tagDraft }); setTagFor(null); } }}>Save</button></>}>
      <label className="ids-label" htmlFor="m-tags" style={{ marginTop: 0 }}>Tags</label><TagInput id="m-tags" value={tagDraft} onChange={setTagDraft} suggestions={allTags} /></Modal>
  </main>;
}

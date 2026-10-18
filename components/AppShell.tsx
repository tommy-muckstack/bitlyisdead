"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { BP } from "@/lib/basepath";
import { trackNow, identify, resetIdentity, EVENTS } from "@/lib/telemetry";
import "@/app/appshell.css";

export type ShellItem = { label: string; href: string; icon: string; badge?: string; also?: string[] };
export type ShellCfg = {
  mode: "side" | "top";
  vars?: Record<string, string>;
  items: ShellItem[]; foot?: ShellItem[];
  create?: ShellItem[];
  search?: string; right?: { label: string; href: string; solid?: boolean }[];
  title?: string; logoSize?: number;
};
const P: Record<string, string> = {
  home: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z", link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1", qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM18 18h3v3h-3z",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2", doc: "M6 3h9l5 5v13H6zM14 3v6h6", settings: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2", plus: "M12 5v14M5 12h14", search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5",
  grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z", folder: "M3 6h7l2 2h9v11H3z", globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18", star: "M12 3l3 6 6 1-4.5 4.5 1 6.5L12 18l-5.5 3 1-6.5L3 10l6-1z", chevron: "M6 9l6 6 6-6",
};
export const Ic = ({ n, s = 20 }: { n: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={P[n] || P.grid} /></svg>;
type Hit = { kind: "link" | "qr" | "page"; id: string; title: string; sub: string; href: string };

function useOutside(ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [ref, close]);
}
/** Header search: live results across links, QR Codes and Pages; Enter opens the Links page filtered by the term. */
function GlobalSearch({ placeholder }: { placeholder: string }) {
  const r = useRouter(); const [q, setQ] = useState(""); const [hits, setHits] = useState<Hit[] | null>(null); const [open, setOpen] = useState(false); const box = useRef<HTMLDivElement>(null);
  useOutside(box, () => setOpen(false));
  useEffect(() => { const s = q.trim(); if (!s) { setHits(null); return; } const ac = new AbortController(); const t = setTimeout(async () => { try { const res = await fetch(`${BP}/api/search?q=${encodeURIComponent(s)}`, { signal: ac.signal }); if (res.ok) { setHits((await res.json()).hits); setOpen(true); } } catch { /* aborted */ } }, 160); return () => { clearTimeout(t); ac.abort(); }; }, [q]);
  const go = (href: string) => { setOpen(false); setQ(""); r.push(href); };
  return <div className="as-search" ref={box}>
    <form role="search" onSubmit={e => { e.preventDefault(); if (q.trim()) go(`/app/links?q=${encodeURIComponent(q.trim())}`); }}><Ic n="search" s={16} /><input placeholder={placeholder} aria-label="Search" value={q} onChange={e => setQ(e.target.value)} onFocus={() => hits && setOpen(true)} /></form>
    {open && hits && <div className="as-hits" role="listbox" aria-label="Search results">
      {hits.length === 0 && <p className="as-hit as-hit--none">No links, QR Codes or Pages match “{q.trim()}”.</p>}
      {hits.map(h => <button type="button" role="option" aria-selected={false} key={h.kind + h.id} className="as-hit" onClick={() => go(h.href)}><Ic n={h.kind === "qr" ? "qr" : h.kind === "page" ? "doc" : "link"} s={16} /><span><b>{h.title}</b><small>{h.sub}</small></span><em>{h.kind === "qr" ? "QR Code" : h.kind === "page" ? "Page" : "Link"}</em></button>)}
      {hits.length > 0 && <button type="button" className="as-hit as-hit--all" onClick={() => go(`/app/links?q=${encodeURIComponent(q.trim())}`)}>See all links matching “{q.trim()}” →</button>}
    </div>}
  </div>;
}
function CreateMenu({ items }: { items: ShellItem[] }) {
  const [open, setOpen] = useState(false); const box = useRef<HTMLDivElement>(null); useOutside(box, () => setOpen(false));
  if (items.length === 1) return <Link href={items[0]!.href} className="as-cta"><Ic n="plus" s={18} />Create new</Link>;
  return <div className="as-create" ref={box}><button type="button" className="as-cta" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><Ic n="plus" s={18} />Create new<Ic n="chevron" s={16} /></button>
    {open && <div role="menu" className="as-menu">{items.map(it => <Link role="menuitem" key={it.label} href={it.href} onClick={() => setOpen(false)}><Ic n={it.icon} s={18} />{it.label}</Link>)}</div>}</div>;
}
export function AppShell({ user, cfg, children }: { user: { id: string; name: string; email: string; demo: boolean; guest?: boolean }; cfg: ShellCfg; children: React.ReactNode }) {
  // PostHog identity: signed-in Firebase users by uid; guests and the demo account stay anonymous (account_type only).
  useEffect(() => { identify(user.id, user.guest ? "guest" : user.demo ? "demo" : "firebase"); }, [user.id, user.guest, user.demo]);
  const signOut = (e: React.FormEvent<HTMLFormElement>) => { const f = e.currentTarget; e.preventDefault(); void trackNow(EVENTS.app_signed_out).then(() => { resetIdentity(); f.submit(); }); };
  const path = usePathname() || "";
  const rel = path.startsWith(BP) ? path.slice(BP.length) || "/" : path;
  const on = (it: ShellItem) => it.href === "/app" ? rel === "/app" : rel === it.href || rel.startsWith(it.href + "/") || (it.also ?? []).some(a => rel.startsWith(a));
  const initial = (user.name || user.email || "?").trim()[0]?.toUpperCase();
  const nav = (it: ShellItem) => <Link key={it.label} href={it.href} className={"as-it" + (on(it) ? " on" : "")} aria-current={on(it) ? "page" : undefined}><Ic n={it.icon} /><span>{it.label}</span>{it.badge && <em>{it.badge}</em>}</Link>;
  return <div className={"as as--" + cfg.mode} style={cfg.vars as React.CSSProperties}>
    {cfg.mode === "side" && <aside className="as-side">
      <Link href="/app" className="as-logo"><Logo size={cfg.logoSize ?? 28} /></Link>
      {cfg.create && cfg.create.length > 0 && <CreateMenu items={cfg.create} />}
      <nav className="as-nav" aria-label="Main">{cfg.items.map(nav)}</nav>
      <div className="as-foot">{cfg.foot?.map(nav)}</div>
    </aside>}
    <div className="as-main">
      <header className="as-top">
        {cfg.mode === "top" && <><Link href="/app" className="as-logo"><Logo size={cfg.logoSize ?? 26} /></Link><nav className="as-tnav">{cfg.items.map(it => <Link key={it.label} href={it.href} className={on(it) ? "on" : ""}>{it.label}</Link>)}</nav></>}
        {cfg.title && cfg.mode === "side" && <b className="as-title">{cfg.title}</b>}
        {cfg.search && <GlobalSearch placeholder={cfg.search} />}
        <div className="as-right">
          {cfg.right?.map(r => <Link key={r.label} href={r.href} className={"as-btn" + (r.solid ? " solid" : "")}>{r.label}</Link>)}
          {user.guest ? <Link href="/login?callbackUrl=/app" className="as-guest" title="You're using BitlyIsDead as a guest. Sign in to keep your links on every device."><span className="as-me">{initial}</span><span>Guest · <u>sign in to keep your work</u></span></Link>
            : <Link href="/app/settings" className="as-me" title={user.demo ? "Demo account" : user.email} aria-label="Account settings">{initial}</Link>}
          <form method="post" action={`${BP}/api/session/logout`} onSubmit={signOut}><button className="as-out">Sign out</button></form>
        </div>
      </header>
      <div className="as-body">{children}</div>
    </div>
  </div>;
}

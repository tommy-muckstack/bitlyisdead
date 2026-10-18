"use client";
// Pages builder: profile, theme, blocks (add / edit / reorder / remove), URL, publish — with a live phone preview.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/telemetry";
import { CopyButton, useOrigin } from "@/components/LinksApp";
import { PublicPage } from "@/components/PublicPage";
import { THEMES, type Block, type PageDoc } from "@/lib/pages-types";
import { plural } from "@/lib/links";
import "@/app/page-public.css";
const nid = () => Math.random().toString(36).slice(2, 10);
export function PageEditor({ initial }: { initial: PageDoc }) {
  const origin = useOrigin(); const r = useRouter(); const [p, setP] = useState(initial); const [slug, setSlug] = useState(initial.slug); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const dirty = JSON.stringify(p) !== JSON.stringify(initial) || slug !== initial.slug;
  const set = <K extends keyof PageDoc>(k: K, v: PageDoc[K]) => setP(x => ({ ...x, [k]: v }));
  const blocks = (f: (b: Block[]) => Block[]) => set("blocks", f(p.blocks));
  const add = (type: Block["type"]) => blocks(b => [...b, { id: nid(), type, title: type === "heading" ? "New section" : type === "text" ? "" : "", url: "", clicks: 0 }]);
  const move = (i: number, d: -1 | 1) => blocks(b => { const n = [...b]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j]!, n[i]!]; return n; });
  const save = async (extra: object = {}) => { setBusy(true); setErr(""); setMsg(""); const res = await fetch(`${BP}/api/pages/${p.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: p.title, bio: p.bio, emoji: p.emoji, theme: p.theme, blocks: p.blocks, slug, ...extra }) }); const j = await res.json().catch(() => ({})); setBusy(false); if (!res.ok) return setErr(j.error ?? "Could not save."); if ("published" in extra) track(EVENTS.app_page_published, { published: !!j.page.published, blocks: j.page.blocks?.length ?? 0 }); setP(j.page); setSlug(j.page.slug); setMsg("Saved"); r.refresh(); };
  const url = `${origin}${BP}/p/${slug}`;
  return <main className="bl-app pe"><p><Link href="/app/pages">← Pages</Link></p>
    <div className="pe-grid"><div className="pe-form">
      <section className="ids-card bl-panel"><div className="bl-panel__hd"><h1 className="ids-h2" style={{ fontSize: 24, margin: 0 }}>Edit page</h1><span className="ids-pill">{p.published ? "Published" : "Draft"}</span></div>
        <label className="ids-label" htmlFor="pe-title" style={{ marginTop: 0 }}>Title</label><input id="pe-title" className="ids-input" value={p.title} maxLength={60} onChange={e => set("title", e.target.value)} />
        <label className="ids-label" htmlFor="pe-bio">Bio</label><textarea id="pe-bio" className="ids-input" rows={2} maxLength={160} value={p.bio} onChange={e => set("bio", e.target.value)} />
        <label className="ids-label" htmlFor="pe-emoji">Avatar emoji <span className="ids-muted">(optional)</span></label><input id="pe-emoji" className="ids-input" value={p.emoji} maxLength={4} placeholder="🌱" style={{ maxWidth: 120 }} onChange={e => set("emoji", e.target.value)} />
        <label className="ids-label">Theme</label><div className="qr-opts" role="radiogroup" aria-label="Theme">{THEMES.map(t => <button type="button" key={t} role="radio" aria-checked={p.theme === t} className={"iconbtn" + (p.theme === t ? " on" : "")} onClick={() => set("theme", t)}>{t[0]!.toUpperCase() + t.slice(1)}</button>)}</div>
        <label className="ids-label" htmlFor="pe-slug">Page URL</label><div className="bl-back"><span className="ids-muted">{origin.replace(/^https?:\/\//, "")}{BP}/p/</span><input id="pe-slug" className="ids-input" value={slug} maxLength={40} onChange={e => setSlug(e.target.value.toLowerCase())} /></div></section>
      <section className="ids-card bl-panel"><div className="bl-panel__hd"><h2 className="ids-h3" style={{ fontSize: 18, margin: 0 }}>Blocks</h2><span className="ids-muted" style={{ fontSize: 13 }}>{plural(p.blocks.length, "block")}</span></div>
        <ul className="pe-blocks">{p.blocks.map((b, i) => <li key={b.id} className="pe-block" data-block={b.type}><div className="pe-block__hd"><span className="ids-pill">{b.type === "link" ? "Link" : b.type === "heading" ? "Heading" : "Text"}</span>{b.type === "link" && <span className="ids-muted" style={{ fontSize: 12 }}>{plural(b.clicks, "click")}</span>}<span className="bl-grow" /><button type="button" className="iconbtn" aria-label={`Move block ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button><button type="button" className="iconbtn" aria-label={`Move block ${i + 1} down`} disabled={i === p.blocks.length - 1} onClick={() => move(i, 1)}>↓</button><button type="button" className="iconbtn" aria-label={`Remove block ${i + 1}`} onClick={() => blocks(x => x.filter(y => y.id !== b.id))}>×</button></div>
          {b.type === "text" ? <textarea className="ids-input" aria-label={`Block ${i + 1} text`} rows={2} maxLength={400} value={b.title} placeholder="Write something" onChange={e => blocks(x => x.map(y => y.id === b.id ? { ...y, title: e.target.value } : y))} />
            : <input className="ids-input" aria-label={`Block ${i + 1} title`} value={b.title} maxLength={80} placeholder={b.type === "link" ? "Button label" : "Section heading"} onChange={e => blocks(x => x.map(y => y.id === b.id ? { ...y, title: e.target.value } : y))} />}
          {b.type === "link" && <input className="ids-input" aria-label={`Block ${i + 1} URL`} value={b.url} inputMode="url" placeholder="https://example.com" onChange={e => blocks(x => x.map(y => y.id === b.id ? { ...y, url: e.target.value } : y))} />}</li>)}</ul>
        <div className="tb" style={{ marginTop: 10 }}><button type="button" className="iconbtn" onClick={() => add("link")}>+ Link</button><button type="button" className="iconbtn" onClick={() => add("heading")}>+ Heading</button><button type="button" className="iconbtn" onClick={() => add("text")}>+ Text</button></div></section>
      {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: 0 }}>{err}</p>}
      <div className="pe-ft"><button type="button" className="ids-btn ids-btn--primary" disabled={busy} onClick={() => save()}>{busy ? "Saving…" : dirty ? "Save changes" : "Saved"}</button><button type="button" className="ids-btn ids-btn--outline" disabled={busy} onClick={() => save({ published: !p.published })}>{p.published ? "Unpublish" : "Publish"}</button>{p.published && <><a className="ids-btn ids-btn--outline" href={`${BP}/p/${p.slug}`} target="_blank" rel="noreferrer">View live page</a><CopyButton text={url} label="Copy URL" /></>}<span role="status" className="ids-muted">{msg}</span></div>
    </div>
    <aside className="pe-prev"><div className="pe-phone"><PublicPage page={{ ...p, slug }} preview /></div><p className="ids-muted" style={{ fontSize: 12, textAlign: "center" }}>{plural(p.views, "view")} so far{p.published ? "" : " · publish to make it public"}</p></aside></div>
  </main>;
}

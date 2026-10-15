"use client";
// Create-link flow (Bitly's /links/create): destination, title, domain + back-half, tags, expiry.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { useOrigin } from "@/components/LinksApp";
import { TagInput } from "@/components/TagInput";
export function CreateLink({ prefill, domains = [] }: { prefill?: string; domains?: string[] }) {
  const r = useRouter(); const origin = useOrigin(); const [url, setUrl] = useState(prefill ?? ""); const [title, setTitle] = useState(""); const [back, setBack] = useState(""); const [exp, setExp] = useState(""); const [tags, setTags] = useState<string[]>([]); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const host = origin.replace(/^https?:\/\//, "") || "yourappisdead.com";
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr("");
    const res = await fetch(`${BP}/api/links`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, title, backHalf: back, tags, expiresAt: exp ? new Date(exp + "T23:59:59").toISOString() : null }) }); const j = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) return setErr(j.error ?? "Something went wrong.");
    try { await navigator.clipboard.writeText(`${origin}${BP}/s/${j.link.code}`); } catch { /* blocked */ }
    r.push(`/app/l/${j.link.code}?created=1`); r.refresh(); };
  return <main className="bl-app bl-create"><p><Link href="/app/links">← Links</Link></p>
    <form className="ids-card bl-new" onSubmit={submit}><h1 className="ids-h2" style={{ fontSize: 26, margin: "0 0 18px" }}>Create a link</h1>
      <label className="ids-label" htmlFor="c-url">Destination</label><input id="c-url" className="ids-input" placeholder="https://example.com/my-long-url" value={url} onChange={e => setUrl(e.target.value)} inputMode="url" autoComplete="off" required />
      <label className="ids-label" htmlFor="c-title">Title <span className="ids-muted">(optional)</span></label><input id="c-title" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} />
      <div className="bl-create__half"><div><label className="ids-label" htmlFor="c-dom">Domain</label><select id="c-dom" className="ids-input" defaultValue={host}>{[host, ...domains].map(d => <option key={d} value={d}>{d}{BP}/s/</option>)}</select></div>
        <div><label className="ids-label" htmlFor="c-back">Custom back-half <span className="ids-muted">(optional)</span></label><input id="c-back" className="ids-input" value={back} maxLength={40} onChange={e => setBack(e.target.value)} placeholder="my-launch" /></div></div>
      <label className="ids-label" htmlFor="c-tags">Tags <span className="ids-muted">(optional)</span></label><TagInput id="c-tags" value={tags} onChange={setTags} />
      <label className="ids-label" htmlFor="c-exp">Expires <span className="ids-muted">(optional)</span></label><input id="c-exp" type="date" className="ids-input" value={exp} onChange={e => setExp(e.target.value)} style={{ maxWidth: 240 }} />
      {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "12px 0 0" }}>{err}</p>}
      <div className="bl-create__ft"><Link href="/app/links" className="ids-btn ids-btn--outline">Cancel</Link><button className="ids-btn ids-btn--primary" disabled={busy || !url.trim()}>{busy ? "Creating…" : "Create your link"}</button></div>
    </form></main>;
}

"use client";
// Create-link flow (Bitly's /links/create): destination, title, domain + custom back-half, UTM builder, QR Code toggle, tags, expiry.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { useOrigin } from "@/components/LinksApp";
import { TagInput } from "@/components/TagInput";
import { UtmBuilder, applyUtm, emptyUtm } from "@/components/UtmBuilder";
export function CreateLink({ prefill, domains = [], campaign, suggestions = [] }: { prefill?: string; domains?: string[]; campaign?: { id: string; name: string; utm?: Partial<ReturnType<typeof emptyUtm>> } | null; suggestions?: string[] }) {
  const r = useRouter(); const origin = useOrigin(); const [url, setUrl] = useState(prefill ?? ""); const [title, setTitle] = useState(""); const [domain, setDomain] = useState(""); const [back, setBack] = useState(""); const [exp, setExp] = useState(""); const [tags, setTags] = useState<string[]>([]); const [utm, setUtm] = useState({ ...emptyUtm(), ...(campaign?.utm ?? {}) }); const [qr, setQr] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const host = origin.replace(/^https?:\/\//, "") || "yourappisdead.com"; const dest = applyUtm(url, utm);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); const t0 = performance.now();
    const res = await fetch(`${BP}/api/links`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: dest, title, backHalf: back, tags, campaignId: campaign?.id ?? null, domain: domain || undefined, expiresAt: exp ? new Date(exp + "T23:59:59").toISOString() : null }) }); const j = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) return setErr(j.error ?? "Something went wrong.");
    try { await navigator.clipboard.writeText(`${origin}${BP}/s/${j.link.code}`); } catch { /* blocked */ }
    if (process.env.NODE_ENV !== "production") console.info(`link created in ${Math.round(performance.now() - t0)} ms`);
    r.push(qr ? `/app/qr/new?link=${j.link.code}` : `/app/l/${j.link.code}?created=1`); r.refresh(); };
  return <main className="bl-app bl-create"><p><Link href={campaign ? `/app/campaigns/${campaign.id}` : "/app/links"}>← {campaign ? campaign.name : "Links"}</Link></p>
    <form className="ids-card bl-new" onSubmit={submit}><h1 className="ids-h2" style={{ fontSize: 26, margin: "0 0 18px" }}>Create a link{campaign ? <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}> in {campaign.name}</span> : null}</h1>
      <label className="ids-label" htmlFor="c-url">Destination</label><input id="c-url" className="ids-input" placeholder="https://example.com/my-long-url" value={url} onChange={e => setUrl(e.target.value)} inputMode="url" autoComplete="off" required />
      <label className="ids-label" htmlFor="c-title">Title <span className="ids-muted">(optional)</span></label><input id="c-title" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} />
      <h2 className="bl-create__h">Short link</h2>
      <div className="bl-create__half"><div><label className="ids-label" htmlFor="c-dom">Domain</label><select id="c-dom" className="ids-input" value={domain} onChange={e => setDomain(e.target.value)}><option value="">{host}{BP}/s/</option>{domains.map(d => <option key={d} value={d}>{d}/</option>)}</select></div>
        <div><label className="ids-label" htmlFor="c-back">Custom back-half <span className="ids-muted">(optional)</span></label><input id="c-back" className="ids-input" value={back} maxLength={40} onChange={e => setBack(e.target.value)} placeholder="my-launch" /></div></div>
      <h2 className="bl-create__h">Ways to share</h2>
      <label className="sw"><input type="checkbox" role="switch" aria-checked={qr} checked={qr} onChange={e => setQr(e.target.checked)} /><i /><span>QR Code <small className="ids-muted">Generate a QR Code to share anywhere people can scan it</small></span></label>
      <UtmBuilder url={url} value={utm} onChange={setUtm} />
      <h2 className="bl-create__h">Organize</h2>
      <label className="ids-label" htmlFor="c-tags">Tags <span className="ids-muted">(optional)</span></label><TagInput id="c-tags" value={tags} onChange={setTags} suggestions={suggestions} />
      <label className="ids-label" htmlFor="c-exp">Expires <span className="ids-muted">(optional)</span></label><input id="c-exp" type="date" className="ids-input" value={exp} onChange={e => setExp(e.target.value)} style={{ maxWidth: 240 }} />
      {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "12px 0 0" }}>{err}</p>}
      <div className="bl-create__ft"><Link href="/app/links" className="ids-btn ids-btn--outline">Cancel</Link><button className="ids-btn ids-btn--primary" disabled={busy || !url.trim()}>{busy ? "Creating…" : qr ? "Continue to QR Code" : "Create your link"}</button></div>
    </form></main>;
}

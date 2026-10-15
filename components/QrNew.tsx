"use client";
// Create a QR Code: step 1 destination (or an existing link), step 2 design. Mirrors Bitly's two-step "Create new → QR Code".
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { useOrigin } from "@/components/LinksApp";
import { QrDesigner } from "@/components/QrDesigner";
import { UtmBuilder, applyUtm, emptyUtm } from "@/components/UtmBuilder";
import { DEFAULT_STYLE, type QrStyle } from "@/lib/qr";
import type { Link as L } from "@/lib/links";
export function QrNew({ link, prefill }: { link: L | null; prefill?: string }) {
  const r = useRouter(); const origin = useOrigin(); const [step, setStep] = useState<1 | 2>(link ? 2 : 1); const [url, setUrl] = useState(prefill ?? ""); const [title, setTitle] = useState(link?.title ?? ""); const [back, setBack] = useState(""); const [utm, setUtm] = useState(emptyUtm()); const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const code = link?.code ?? "preview"; const data = `${origin}${BP}/s/${code}?r=qr`;
  const create = async () => { setBusy(true); setErr(""); const res = await fetch(`${BP}/api/qrcodes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(link ? { code: link.code, title, style } : { url: applyUtm(url, utm), title, backHalf: back, style }) }); const j = await res.json().catch(() => ({})); setBusy(false); if (!res.ok) return setErr(j.error ?? "Something went wrong."); r.push(`/app/qr/${j.qr.id}?created=1`); r.refresh(); };
  return <main className="bl-app bl-create" style={{ maxWidth: step === 2 ? 1040 : 760 }}><p><Link href={link ? `/app/l/${link.code}` : "/app/qr"}>← {link ? "Link details" : "QR Codes"}</Link></p>
    <div className="ids-card bl-new"><h1 className="ids-h2" style={{ fontSize: 26, margin: "0 0 4px" }}>{step === 1 ? "Create a QR Code" : "Design your code"}</h1><p className="ids-muted" style={{ margin: "0 0 18px" }}>Step {step} of 2 · {step === 1 ? "Where should it send people?" : "Customize the look, then create it."}</p>
      {step === 1 ? <form onSubmit={e => { e.preventDefault(); if (url.trim()) setStep(2); }}>
        <label className="ids-label" htmlFor="q-url">Destination URL</label><input id="q-url" className="ids-input" placeholder="https://example.com/menu" value={url} onChange={e => setUrl(e.target.value)} inputMode="url" autoComplete="off" required />
        <label className="ids-label" htmlFor="q-title">Title <span className="ids-muted">(optional)</span></label><input id="q-title" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} />
        <label className="ids-label" htmlFor="q-back">Short link back-half <span className="ids-muted">(optional)</span></label><div className="bl-back"><span className="ids-muted">{origin.replace(/^https?:\/\//, "")}{BP}/s/</span><input id="q-back" className="ids-input" value={back} maxLength={40} onChange={e => setBack(e.target.value)} placeholder="spring-menu" /></div>
        <p className="ids-muted" style={{ fontSize: 13, margin: "6px 0 0" }}>Every QR Code gets a short link, so you can change the destination later without reprinting.</p>
        <UtmBuilder url={url} value={utm} onChange={setUtm} id="qutm" />
        <div className="bl-create__ft"><Link href="/app/qr" className="ids-btn ids-btn--outline">Cancel</Link><button className="ids-btn ids-btn--primary" disabled={!url.trim()}>Design your code</button></div></form>
      : <>{link && <p className="bl-fresh" style={{ marginTop: 0 }}>This QR Code will open <b>{link.title || link.url}</b> ({origin.replace(/^https?:\/\//, "")}{BP}/s/{link.code}).</p>}
        {!link && <><label className="ids-label" htmlFor="q-title2" style={{ marginTop: 0 }}>Title <span className="ids-muted">(optional)</span></label><input id="q-title2" className="ids-input" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} style={{ maxWidth: 420, marginBottom: 16 }} /></>}
        <QrDesigner data={data} style={style} onChange={setStyle} />
        {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "12px 0 0" }}>{err}</p>}
        <div className="bl-create__ft">{!link && <button type="button" className="ids-btn ids-btn--outline" onClick={() => setStep(1)}>Back</button>}<button type="button" className="ids-btn ids-btn--primary" disabled={busy} onClick={create}>{busy ? "Creating…" : "Create your code"}</button></div></>}
    </div></main>;
}

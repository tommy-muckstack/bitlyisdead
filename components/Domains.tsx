"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/telemetry";
import { Confirm } from "@/components/Modal";
import { CopyButton, useOrigin } from "@/components/LinksApp";
import { plural } from "@/lib/links";
import type { DomainDoc } from "@/lib/domainstore";
export function Domains({ initial }: { initial: DomainDoc[] }) {
  const origin = useOrigin(); const r = useRouter(); const [rows, setRows] = useState(initial); const [host, setHost] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState<string | null>(null); const [del, setDel] = useState<DomainDoc | null>(null); const ownHost = origin.replace(/^https?:\/\//, "").split(":")[0] || "yourappisdead.com";
  const add = async (e: React.FormEvent) => { e.preventDefault(); setBusy("add"); setErr(""); const res = await fetch(`${BP}/api/domains`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ host }) }); const j = await res.json().catch(() => ({})); setBusy(null); if (!res.ok) return setErr(j.error ?? "Could not add that domain."); track(EVENTS.app_domain_added); setRows(rs => [j.domain, ...rs]); setHost(""); r.refresh(); };
  const verify = async (d: DomainDoc) => { setBusy(d.id); const res = await fetch(`${BP}/api/domains/${d.id}/verify`, { method: "POST" }); setBusy(null); if (res.ok) { const { domain } = await res.json(); setRows(rs => rs.map(x => x.id === d.id ? domain : x)); r.refresh(); } };
  const remove = async (d: DomainDoc) => { setDel(null); if ((await fetch(`${BP}/api/domains/${d.id}`, { method: "DELETE" })).ok) { setRows(rs => rs.filter(x => x.id !== d.id)); r.refresh(); } };
  return <main className="bl-app bl-links">
    <div className="bl-head"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>Custom domains <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(rows.length, "domain")}</span></h1></div>
    <section className="ids-card bl-new"><h2 className="ids-h3" style={{ margin: "0 0 6px" }}>Add a domain</h2><p className="ids-muted" style={{ margin: "0 0 12px" }}>Prove you own a domain with a DNS record. Verification is real; serving short links on your domain needs a self-hosted deployment (see the note on each domain).</p>
      <form onSubmit={add} className="bl-new__row"><input className="ids-input" aria-label="Domain" placeholder="go.example.com" value={host} onChange={e => setHost(e.target.value)} autoComplete="off" required /><button className="ids-btn ids-btn--primary" disabled={busy === "add" || !host.trim()}>{busy === "add" ? "Adding…" : "Add domain"}</button></form>
      {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "10px 0 0" }}>{err}</p>}</section>
    <ul className="bl-list" data-testid="domains">{rows.map(d => <li key={d.id} className="ids-card bl-panel dm" data-id={d.id}>
      <div className="bl-panel__hd" style={{ marginBottom: 6 }}><h3 className="ids-h3" style={{ fontSize: 18, margin: 0 }}>{d.host}</h3><span className={"ids-pill" + (d.status === "verified" ? " ok" : "")}>{d.status === "verified" ? "Verified" : "Pending verification"}</span></div>
      <p className="ids-muted" style={{ margin: "0 0 10px", fontSize: 14 }}>{d.status === "verified" ? <>Ownership verified{d.verifiedAt ? ` on ${new Date(d.verifiedAt).toLocaleDateString()}` : ""}. CNAME {d.cname === "ok" ? "points here." : "not pointing here yet."} <b>Routing note:</b> the hosted BitlyIsDead can't answer for your domain; a self-hosted copy with this CNAME serves <code>{d.host}/&lt;back-half&gt;</code>.</> : "Add these two DNS records at your registrar, then click Verify. Changes can take up to an hour to propagate."}</p>
      <table className="dm-tbl"><thead><tr><th>Type</th><th>Name</th><th>Value</th><th></th></tr></thead><tbody>
        <tr><td>TXT</td><td><code>_bitlyisdead.{d.host}</code></td><td><code>bitlyisdead-verify={d.token}</code></td><td><CopyButton text={`bitlyisdead-verify=${d.token}`} /></td></tr>
        <tr><td>CNAME</td><td><code>{d.host}</code></td><td><code>{ownHost}</code></td><td><CopyButton text={ownHost} /></td></tr></tbody></table>
      {d.lastError && <p role="status" style={{ margin: "8px 0 0", fontSize: 13, color: "#9a4b1b" }}>{d.lastError}</p>}
      <div className="tb" style={{ marginTop: 12 }}><button type="button" className="ids-btn ids-btn--primary" disabled={busy === d.id} onClick={() => verify(d)}>{busy === d.id ? "Checking DNS…" : d.status === "verified" ? "Re-check" : "Verify"}</button><button type="button" className="ids-btn ids-btn--outline" aria-label={`Remove ${d.host}`} onClick={() => setDel(d)}>Remove</button>{d.lastCheckAt && <span className="ids-muted" style={{ fontSize: 12 }}>Last checked {new Date(d.lastCheckAt).toLocaleTimeString()}</span>}</div></li>)}
      {rows.length === 0 && <li className="ids-card bl-empty">No custom domains yet.</li>}</ul>
    <Confirm open={!!del} title="Remove this domain?" body={<p>You can add it again later; the DNS records stay at your registrar.</p>} confirmLabel="Remove" onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
  </main>;
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { Confirm, Modal } from "@/components/Modal";
import { Bars } from "@/components/LinkDetails";
import { shortUrl, useOrigin } from "@/components/LinksApp";
import { plural, hostOf, type Link as L } from "@/lib/links";
import type { CampaignDoc } from "@/lib/campaignstore";
import type { Agg } from "@/lib/analytics";
export function CampaignsList({ initial, links }: { initial: CampaignDoc[]; links: L[] }) {
  const r = useRouter(); const [rows, setRows] = useState(initial); const [del, setDel] = useState<CampaignDoc | null>(null);
  const remove = async (c: CampaignDoc) => { setDel(null); if ((await fetch(`${BP}/api/campaigns/${c.id}`, { method: "DELETE" })).ok) { setRows(rs => rs.filter(x => x.id !== c.id)); r.refresh(); } };
  return <main className="bl-app bl-links">
    <div className="bl-head"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>Campaigns <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(rows.length, "campaign")}</span></h1><Link href="/app/campaigns/new" className="ids-btn ids-btn--primary">Create campaign</Link></div>
    <p className="ids-muted" style={{ margin: 0 }}>Group the links for one launch, event or channel, give them shared UTM parameters, and read their results together.</p>
    <ul className="bl-list" data-testid="campaigns">{rows.map(c => { const ls = links.filter(l => l.campaignId === c.id); const clicks = ls.reduce((n, l) => n + l.stats.clicks + (l.stats.scans ?? 0), 0); return <li key={c.id} className="ids-card bl-row" data-id={c.id}>
      <div className="bl-row__main"><Link className="bl-row__t" href={`/app/campaigns/${c.id}`}>{c.name}</Link>{c.description && <div className="bl-row__u">{c.description}</div>}<div className="bl-row__meta"><span>{plural(ls.length, "link")}</span>{c.utm.source && <span className="bl-tag">utm_source={c.utm.source}</span>}{c.utm.medium && <span className="bl-tag">utm_medium={c.utm.medium}</span>}{c.utm.campaign && <span className="bl-tag">utm_campaign={c.utm.campaign}</span>}</div></div>
      <div className="bl-row__stat"><b>{clicks.toLocaleString()}</b><span className="ids-muted">engagements</span></div>
      <div className="bl-row__act"><Link className="iconbtn" href={`/app/campaigns/${c.id}`}>Open</Link><button type="button" className="iconbtn" aria-label={`Delete ${c.name}`} onClick={() => setDel(c)}>Delete</button></div></li>; })}
      {rows.length === 0 && <li className="ids-card bl-empty">No campaigns yet. <Link href="/app/campaigns/new">Create your first campaign</Link>.</li>}</ul>
    <Confirm open={!!del} title="Delete this campaign?" body={<p>Its links stay in your account; they just leave the campaign.</p>} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
  </main>;
}
export function CampaignForm({ initial }: { initial?: CampaignDoc }) {
  const r = useRouter(); const [name, setName] = useState(initial?.name ?? ""); const [desc, setDesc] = useState(initial?.description ?? ""); const [utm, setUtm] = useState(initial?.utm ?? { source: "", medium: "", campaign: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); const res = await fetch(initial ? `${BP}/api/campaigns/${initial.id}` : `${BP}/api/campaigns`, { method: initial ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, description: desc, utm }) }); const j = await res.json().catch(() => ({})); setBusy(false); if (!res.ok) return setErr(j.error ?? "Something went wrong."); r.push(`/app/campaigns/${j.campaign.id}`); r.refresh(); };
  return <main className="bl-app bl-create"><p><Link href={initial ? `/app/campaigns/${initial.id}` : "/app/campaigns"}>← {initial ? initial.name : "Campaigns"}</Link></p>
    <form className="ids-card bl-new" onSubmit={submit}><h1 className="ids-h2" style={{ fontSize: 26, margin: "0 0 18px" }}>{initial ? "Edit campaign" : "Create a campaign"}</h1>
      <label className="ids-label" htmlFor="cp-name">Name</label><input id="cp-name" className="ids-input" value={name} maxLength={60} required onChange={e => setName(e.target.value)} placeholder="Spring launch" />
      <label className="ids-label" htmlFor="cp-desc">Description <span className="ids-muted">(optional)</span></label><input id="cp-desc" className="ids-input" value={desc} maxLength={240} onChange={e => setDesc(e.target.value)} />
      <h2 className="bl-create__h">Default UTM parameters</h2><p className="ids-muted" style={{ margin: "8px 0 0", fontSize: 13 }}>Pre-filled on every link you create inside this campaign.</p>
      <div className="utm-grid" style={{ marginTop: 10 }}><div><label className="ids-label" htmlFor="cp-src">Source</label><input id="cp-src" className="ids-input" value={utm.source} maxLength={60} onChange={e => setUtm({ ...utm, source: e.target.value })} placeholder="newsletter" /></div><div><label className="ids-label" htmlFor="cp-med">Medium</label><input id="cp-med" className="ids-input" value={utm.medium} maxLength={60} onChange={e => setUtm({ ...utm, medium: e.target.value })} placeholder="email" /></div><div><label className="ids-label" htmlFor="cp-cmp">Campaign</label><input id="cp-cmp" className="ids-input" value={utm.campaign} maxLength={60} onChange={e => setUtm({ ...utm, campaign: e.target.value })} placeholder="spring-launch" /></div></div>
      {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "12px 0 0" }}>{err}</p>}
      <div className="bl-create__ft"><Link href="/app/campaigns" className="ids-btn ids-btn--outline">Cancel</Link><button className="ids-btn ids-btn--primary" disabled={busy || !name.trim()}>{initial ? "Save" : "Create campaign"}</button></div></form></main>;
}
export function CampaignDetail({ campaign, links, others, agg }: { campaign: CampaignDoc; links: L[]; others: L[]; agg: Agg }) {
  const origin = useOrigin(); const r = useRouter(); const [pick, setPick] = useState(false); const [sel, setSel] = useState<Set<string>>(new Set()); const [busy, setBusy] = useState(false);
  const patch = async (body: object) => { setBusy(true); await fetch(`${BP}/api/campaigns/${campaign.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); setBusy(false); setPick(false); setSel(new Set()); r.refresh(); };
  const max = Math.max(1, ...agg.series.map(x => x.clicks + x.scans)); const tot = agg.clicks + agg.scans;
  return <main className="bl-app"><p><Link href="/app/campaigns">← Campaigns</Link></p>
    <section className="ids-card bl-det" style={{ gridTemplateColumns: "1fr" }}><div><div className="bl-panel__hd" style={{ marginBottom: 4 }}><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>{campaign.name}</h1><div className="tb"><Link className="iconbtn" href={`/app/campaigns/${campaign.id}/edit`}>Edit</Link><Link className="ids-btn ids-btn--primary" href={`/app/links/new?campaign=${campaign.id}`}>Create link</Link></div></div>
      {campaign.description && <p className="ids-muted" style={{ margin: "4px 0 0" }}>{campaign.description}</p>}
      <div className="bl-row__meta">{campaign.utm.source && <span className="bl-tag">utm_source={campaign.utm.source}</span>}{campaign.utm.medium && <span className="bl-tag">utm_medium={campaign.utm.medium}</span>}{campaign.utm.campaign && <span className="bl-tag">utm_campaign={campaign.utm.campaign}</span>}</div>
      <div className="bl-big"><div><b data-testid="cp-clicks">{agg.clicks.toLocaleString()}</b><span className="ids-muted">clicks, 30 days</span></div><div><b>{agg.scans.toLocaleString()}</b><span className="ids-muted">scans, 30 days</span></div><div><b>{links.length}</b><span className="ids-muted">{links.length === 1 ? "link" : "links"}</span></div></div></div></section>
    <section className="ids-card bl-panel"><div className="bl-panel__hd"><h3 className="ids-h3" style={{ fontSize: 18 }}>Links in this campaign</h3><button type="button" className="iconbtn" onClick={() => setPick(true)}>Add existing links</button></div>
      {links.length === 0 ? <p className="ids-muted" style={{ margin: 0 }}>No links yet. Create one with the campaign's UTMs pre-filled, or add links you already have.</p> : <ul className="cp-links" data-testid="cp-links">{links.map(l => <li key={l.code}><div><Link href={`/app/l/${l.code}`}>{l.title || hostOf(l.url)}</Link><div className="bl-row__s" style={{ fontSize: 13 }}>{shortUrl(origin, l.code)}</div></div><b>{plural(l.stats.clicks + (l.stats.scans ?? 0), "engagement")}</b><button type="button" className="iconbtn" disabled={busy} aria-label={`Remove ${l.title || l.code} from campaign`} onClick={() => patch({ removeLinks: [l.code] })}>Remove</button></li>)}</ul>}</section>
    <section className="ids-card bl-panel"><h3 className="ids-h3" style={{ fontSize: 18, marginBottom: 12 }}>Engagements, last 30 days <span className="ids-muted" style={{ fontWeight: 500, fontSize: 13 }}>· {tot.toLocaleString()}</span></h3><div className="bl-chart" role="img" aria-label="Clicks and scans per day">{agg.series.map(x => <div key={x.day} title={`${x.day}: ${x.clicks} clicks, ${x.scans} scans`}><i style={{ height: `${((x.clicks + x.scans) / max) * 100}%` }} /></div>)}</div><div className="bl-chart__ax"><span>{agg.series[0]!.day.slice(5)}</span><span>Today</span></div></section>
    <div className="bl-grid"><Bars title="Top links" rows={agg.topLinks.map(t => ({ name: t.title || hostOf(t.url), count: t.clicks + t.scans }))} total={tot} /><Bars title="Top referrers" rows={agg.referrers} total={tot} /><Bars title="Devices" rows={agg.devices} total={tot} /><Bars title="Countries" rows={agg.countries} total={tot} /></div>
    <Modal open={pick} title="Add links to this campaign" onClose={() => setPick(false)} actions={<><button type="button" className="ids-btn ids-btn--outline" onClick={() => setPick(false)}>Cancel</button><button type="button" className="ids-btn ids-btn--primary" data-autofocus disabled={busy || sel.size === 0} onClick={() => patch({ addLinks: [...sel] })}>Add {sel.size ? plural(sel.size, "link") : "links"}</button></>}>
      {others.length === 0 ? <p className="ids-muted">Every link is already in a campaign, or you have none yet.</p> : <div className="cp-pick">{others.map(l => <label key={l.code}><input type="checkbox" checked={sel.has(l.code)} onChange={() => setSel(s => { const n = new Set(s); if (n.has(l.code)) n.delete(l.code); else n.add(l.code); return n; })} /><span>{l.title || hostOf(l.url)} <span className="ids-muted">· /s/{l.code}</span></span></label>)}</div>}</Modal>
  </main>;
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/telemetry";
import { Confirm } from "@/components/Modal";
import { CopyButton, useOrigin } from "@/components/LinksApp";
import { plural } from "@/lib/links";
import type { PageDoc } from "@/lib/pages-types";
export function PagesList({ initial }: { initial: PageDoc[] }) {
  const origin = useOrigin(); const r = useRouter(); const [rows, setRows] = useState(initial); const [del, setDel] = useState<PageDoc | null>(null); const [busy, setBusy] = useState(false);
  const create = async () => { setBusy(true); const res = await fetch(`${BP}/api/pages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "My page" }) }); setBusy(false); if (res.ok) { const { page } = await res.json(); track(EVENTS.app_page_created); r.push(`/app/pages/${page.id}`); r.refresh(); } };
  const remove = async (p: PageDoc) => { setDel(null); if ((await fetch(`${BP}/api/pages/${p.id}`, { method: "DELETE" })).ok) { setRows(rs => rs.filter(x => x.id !== p.id)); r.refresh(); } };
  return <main className="bl-app bl-links">
    <div className="bl-head"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>Pages <span className="ids-muted" style={{ fontSize: 15, fontWeight: 500 }}>{plural(rows.length, "page")} · {plural(rows.reduce((n, p) => n + p.views, 0), "view")}</span></h1><button type="button" className="ids-btn ids-btn--primary" disabled={busy} onClick={create}>Create page</button></div>
    <p className="ids-muted" style={{ margin: 0 }}>A link-in-bio page puts all your links on one mobile-friendly page you can share from any profile.</p>
    <ul className="bl-list" data-testid="pages">{rows.map(p => <li key={p.id} className="ids-card bl-row pg-row" data-id={p.id}>
      <div className="bl-row__main"><Link className="bl-row__t" href={`/app/pages/${p.id}`}>{p.title}</Link><a className="bl-row__s" href={`${BP}/p/${p.slug}`} target="_blank" rel="noreferrer">{origin.replace(/^https?:\/\//, "")}{BP}/p/{p.slug}</a><div className="bl-row__meta"><span>{plural(p.blocks.length, "block")}</span><span className="ids-pill">{p.published ? "Published" : "Draft"}</span></div></div>
      <div className="bl-row__stat"><b>{p.views.toLocaleString()}</b><span className="ids-muted">{p.views === 1 ? "view" : "views"}</span></div>
      <div className="bl-row__act"><CopyButton text={`${origin}${BP}/p/${p.slug}`} label="Copy link" /><Link className="iconbtn" href={`/app/pages/${p.id}`}>Edit</Link><button type="button" className="iconbtn" aria-label={`Delete ${p.title}`} onClick={() => setDel(p)}>Delete</button></div></li>)}
      {rows.length === 0 && <li className="ids-card bl-empty">No pages yet. Create one to put all your links on one page.</li>}</ul>
    <Confirm open={!!del} title="Delete this page?" body={<p>The public page stops working and its blocks are gone. This can't be undone.</p>} onCancel={() => setDel(null)} onConfirm={() => del && remove(del)} />
  </main>;
}

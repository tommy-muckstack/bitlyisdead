"use client";
// UTM builder (Bitly's "Add UTM parameters"): five standard fields + custom parameters, live preview, applied to the destination.
import { useMemo, useState } from "react";
export type Utm = { source: string; medium: string; campaign: string; term: string; content: string; custom: { k: string; v: string }[] };
export const emptyUtm = (): Utm => ({ source: "", medium: "", campaign: "", term: "", content: "", custom: [] });
/** Destination with the UTM/custom params merged in (existing params are kept; blanks are skipped). */
export function applyUtm(url: string, u: Utm): string {
  const s = url.trim(); if (!s) return s; let full = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : "https://" + s; let out: URL; try { out = new URL(full); } catch { return s; }
  for (const [k, v] of [["utm_source", u.source], ["utm_medium", u.medium], ["utm_campaign", u.campaign], ["utm_term", u.term], ["utm_content", u.content]] as const) if (v.trim()) out.searchParams.set(k, v.trim());
  for (const c of u.custom) if (c.k.trim() && c.v.trim()) out.searchParams.set(c.k.trim(), c.v.trim());
  return out.toString();
}
export const hasUtm = (u: Utm) => !!(u.source || u.medium || u.campaign || u.term || u.content || u.custom.some(c => c.k && c.v));
export function UtmBuilder({ url, value, onChange, id = "utm" }: { url: string; value: Utm; onChange: (u: Utm) => void; id?: string }) {
  const [open, setOpen] = useState(hasUtm(value)); const preview = useMemo(() => applyUtm(url, value), [url, value]);
  const set = (k: keyof Omit<Utm, "custom">) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  return <div className="utm"><label className="sw"><input type="checkbox" role="switch" aria-checked={open} checked={open} onChange={e => { setOpen(e.target.checked); if (!e.target.checked) onChange(emptyUtm()); }} /><i /><span>Add UTM parameters</span></label>
    {open && <div className="utm-body">
      <div className="utm-grid">{([["source", "Source", "e.g. newsletter"], ["medium", "Medium", "e.g. email"], ["campaign", "Campaign", "e.g. spring-sale"], ["term", "Term", "paid keywords"], ["content", "Content", "e.g. header-cta"]] as const).map(([k, l, ph]) => <div key={k}><label className="ids-label" htmlFor={`${id}-${k}`}>{l}</label><input id={`${id}-${k}`} className="ids-input" value={value[k]} placeholder={ph} onChange={set(k)} /></div>)}</div>
      {value.custom.map((c, i) => <div key={i} className="utm-custom"><input className="ids-input" aria-label={`Custom parameter ${i + 1} name`} placeholder="name" value={c.k} onChange={e => onChange({ ...value, custom: value.custom.map((x, j) => j === i ? { ...x, k: e.target.value } : x) })} /><input className="ids-input" aria-label={`Custom parameter ${i + 1} value`} placeholder="value" value={c.v} onChange={e => onChange({ ...value, custom: value.custom.map((x, j) => j === i ? { ...x, v: e.target.value } : x) })} /><button type="button" className="iconbtn" aria-label={`Remove custom parameter ${i + 1}`} onClick={() => onChange({ ...value, custom: value.custom.filter((_, j) => j !== i) })}>×</button></div>)}
      <button type="button" className="bl-more" style={{ padding: "8px 0 0" }} onClick={() => onChange({ ...value, custom: [...value.custom, { k: "", v: "" }] })}>+ Add custom URL parameter</button>
      <p className="utm-prev"><span className="ids-muted">UTM tag preview</span><code data-testid="utm-preview">{preview || "Enter a destination to preview"}</code></p>
    </div>}</div>;
}

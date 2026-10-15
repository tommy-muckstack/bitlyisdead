"use client";
// One optional question after sign-up (Bitly asks a short onboarding survey). The answer only personalises the Home empty state; Skip is always there.
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { Mark } from "@/components/Mark";
const USES = [["links", "Short links for sharing"], ["qr", "QR Codes for print"], ["pages", "A link-in-bio page"], ["marketing", "Campaign tracking with UTMs"], ["api", "The API from my own code"], ["curious", "Just looking around"]];
export function Welcome({ next }: { next: string }) {
  const [use, setUse] = useState(""); const [busy, setBusy] = useState(false);
  const go = async (answer: string) => { setBusy(true); await fetch(`${BP}/api/profile`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ useCase: answer, onboarded: true }) }).catch(() => {}); window.location.assign(next); };
  return <main className="wl"><div className="wl-card"><span className="nf-logo" style={{ fontSize: 24, marginBottom: 6 }}><Mark size={30} />bitlyisdead</span>
    <h1>Welcome! What will you use it for?</h1><p className="ids-muted">One question so Home can point you to the right place. You can skip it.</p>
    <div className="wl-opts" role="radiogroup" aria-label="What will you use BitlyIsDead for?">{USES.map(([k, l]) => <button type="button" key={k} role="radio" aria-checked={use === k} className={"wl-opt" + (use === k ? " on" : "")} onClick={() => setUse(k)}>{l}</button>)}</div>
    <div className="tb" style={{ justifyContent: "flex-end", marginTop: 20 }}><button type="button" className="ids-btn ids-btn--outline" disabled={busy} onClick={() => go("")}>Skip</button><button type="button" className="ids-btn ids-btn--primary" disabled={busy || !use} onClick={() => go(use)}>Continue</button></div>
    </div></main>;
}

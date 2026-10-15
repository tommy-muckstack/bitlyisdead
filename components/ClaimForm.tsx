"use client";
import { useState } from "react";
import { BP } from "@/lib/basepath";
// Hero "shorten a link" box: opens the create-link page with the pasted URL (guest session on the way).
export function ClaimForm({ placeholder, cta }: { prefix?: string; placeholder: string; cta: string }) {
  const [u, setU] = useState("");
  return <form className="mk-claim" onSubmit={e => { e.preventDefault(); location.assign(BP + "/app/links/new" + (u.trim() ? `?url=${encodeURIComponent(u.trim())}` : "")); }}>
    <input aria-label="Paste a long link" className="mk-claim__in" value={u} onChange={e => setU(e.target.value)} placeholder={placeholder} inputMode="url" autoComplete="off" />
    <button className="ids-btn ids-btn--primary">{cta}</button></form>;
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Hero "shorten a link" box: hands the pasted URL to the app after sign-in (/app?url=…).
export function ClaimForm({ placeholder, cta }: { prefix?: string; placeholder: string; cta: string }) {
  const r = useRouter(); const [u, setU] = useState("");
  return <form className="mk-claim" onSubmit={e => { e.preventDefault(); r.push(`/login?callbackUrl=${encodeURIComponent("/app" + (u.trim() ? `?url=${encodeURIComponent(u.trim())}` : ""))}`); }}>
    <input aria-label="Paste a long link" className="mk-claim__in" value={u} onChange={e => setU(e.target.value)} placeholder={placeholder} inputMode="url" autoComplete="off" />
    <button className="ids-btn ids-btn--primary">{cta}</button></form>;
}

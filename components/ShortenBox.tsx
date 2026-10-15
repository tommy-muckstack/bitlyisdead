"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Hero card: tabs + "paste your long link" form. Hands the URL to the app after sign-in (/app?url=…).
export function ShortenBox() {
  const r = useRouter(); const [tab, setTab] = useState<"link" | "qr">("link"); const [u, setU] = useState("");
  const go = (e: React.FormEvent) => { e.preventDefault(); r.push(`/login?callbackUrl=${encodeURIComponent("/app" + (u.trim() ? `?url=${encodeURIComponent(u.trim())}` : ""))}`); };
  return <div className="bz-embed">
    <div className="bz-tabs"><button type="button" className={tab === "link" ? "on" : ""} onClick={() => setTab("link")}><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M9.5 14.5l5-5M8 11l-2 2a3.5 3.5 0 005 5l2-2M16 13l2-2a3.5 3.5 0 00-5-5l-2 2" fill="none" stroke="#F36600" strokeWidth="2" strokeLinecap="round" /></svg>Short Link</button><button type="button" className={tab === "qr" ? "on" : ""} onClick={() => setTab("qr")}><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="#4D6173" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="#4D6173" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="#4D6173" strokeWidth="2" /><path d="M14 14h3v3h-3zM19 19h2v2h-2z" fill="#4D6173" /></svg>QR Code</button></div>
    <form className="bz-card" onSubmit={go}>
      <h2>{tab === "link" ? "Shorten a long link" : "Create a QR Code"}</h2><p className="bz-sub">No credit card required.</p>
      <label htmlFor="bz-url">{tab === "link" ? "Paste your long link here" : "Enter your QR Code destination"}</label>
      <input id="bz-url" value={u} onChange={e => setU(e.target.value)} placeholder="https://example.com/my-long-url" />
      <a className="bz-track" href="/login">Add tracking to your link</a>
      <div className="bz-row"><button className="bz-blue">{tab === "link" ? "Get your link for free" : "Get your QR Code for free"}<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button><span className="bz-rate"><i>G</i><b>★★★★★ 4.5/5</b><small>Loved by 900+ on G2</small></span></div>
    </form>
  </div>;
}

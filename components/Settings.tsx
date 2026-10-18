"use client";
// Settings: profile, security (password), API tokens, billing. Guests and the demo account get a sign-in prompt where an account is required.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BP } from "@/lib/basepath";
import { track, EVENTS } from "@/lib/telemetry";
import { Confirm } from "@/components/Modal";
import { CopyButton } from "@/components/LinksApp";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import type { SessionUser } from "@/lib/session";
import type { Profile } from "@/lib/profile";
type Tok = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string | null };
export function SettingsShell({ children, title }: { children: React.ReactNode; title: string }) {
  const path = usePathname() || ""; const rel = path.replace(/^\/bitlyisdead/, "");
  const tabs = [["/app/settings", "Profile"], ["/app/settings/security", "Security"], ["/app/settings/api", "API"], ["/app/settings/billing", "Billing"]] as const;
  return <main className="bl-app st"><h1 className="ids-h2" style={{ fontSize: 28, margin: 0 }}>Settings</h1>
    <nav className="st-tabs" aria-label="Settings sections">{tabs.map(([h, l]) => <Link key={h} href={h} className={rel === h ? "on" : ""} aria-current={rel === h ? "page" : undefined}>{l}</Link>)}</nav>
    <section className="ids-card bl-panel"><h2 className="ids-h3" style={{ fontSize: 20, margin: "0 0 14px" }}>{title}</h2>{children}</section></main>;
}
export const NeedAccount = ({ what }: { what: string }) => <div className="bl-fresh" style={{ margin: 0 }}><span>{what} needs an account. </span><Link href="/login?callbackUrl=/app/settings">Sign in or create a free account</Link></div>;
export function ProfileSettings({ user, profile }: { user: SessionUser; profile: Profile }) {
  const r = useRouter(); const [name, setName] = useState(profile.name || user.name); const [msg, setMsg] = useState("");
  const save = async (e: React.FormEvent) => { e.preventDefault(); setMsg(""); const res = await fetch(`${BP}/api/profile`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }); setMsg(res.ok ? "Saved" : "Could not save."); r.refresh(); };
  return <SettingsShell title="Profile">{user.guest ? <NeedAccount what="A profile" /> : <form onSubmit={save} style={{ maxWidth: 480 }}>
    <label className="ids-label" htmlFor="st-name" style={{ marginTop: 0 }}>Display name</label><input id="st-name" className="ids-input" value={name} maxLength={60} onChange={e => setName(e.target.value)} />
    <label className="ids-label" htmlFor="st-email">Email</label><input id="st-email" className="ids-input" value={user.demo ? "demo@yourappisdead.com" : user.email} readOnly /><p className="ids-muted" style={{ fontSize: 13, margin: "6px 0 0" }}>Your email is your sign-in and can't be changed here.</p>
    <div className="tb" style={{ marginTop: 16 }}><button className="ids-btn ids-btn--primary">Save</button><span role="status" className="ids-muted">{msg}</span></div></form>}</SettingsShell>;
}
export function SecuritySettings({ user, config }: { user: SessionUser; config: FirebaseClientConfig | null }) {
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const change = async (e: React.FormEvent) => { e.preventDefault(); setErr(""); setMsg(""); if (!config) return setErr("Sign-in isn't configured on this deployment."); setBusy(true);
    try { const { clientAuth, authErrorMessage } = await import("@/lib/isdead-auth/client"); const { signInWithEmailAndPassword, updatePassword } = await import("firebase/auth"); const auth = await clientAuth(config); try { const c = await signInWithEmailAndPassword(auth, user.email, cur); await updatePassword(c.user, nw); setMsg("Password changed."); setCur(""); setNw(""); } catch (x) { setErr(authErrorMessage(x)); } } finally { setBusy(false); } };
  const google = user.provider === "google.com";
  return <SettingsShell title="Security">{user.guest || user.demo ? <NeedAccount what="Changing a password" /> : google ? <p className="ids-muted" style={{ margin: 0 }}>You sign in with Google, so there's no BitlyIsDead password to change. Manage your password in your Google account.</p> : <form onSubmit={change} style={{ maxWidth: 480 }}>
    <label className="ids-label" htmlFor="st-cur" style={{ marginTop: 0 }}>Current password</label><input id="st-cur" className="ids-input" type="password" autoComplete="current-password" required value={cur} onChange={e => setCur(e.target.value)} />
    <label className="ids-label" htmlFor="st-new">New password</label><input id="st-new" className="ids-input" type="password" autoComplete="new-password" required minLength={6} value={nw} onChange={e => setNw(e.target.value)} />
    {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "10px 0 0" }}>{err}</p>}
    <div className="tb" style={{ marginTop: 16 }}><button className="ids-btn ids-btn--primary" disabled={busy}>{busy ? "Changing…" : "Change password"}</button><span role="status" className="ids-muted">{msg}</span></div></form>}</SettingsShell>;
}
export function ApiSettings({ user, initial }: { user: SessionUser; initial: Tok[] }) {
  const [rows, setRows] = useState(initial); const [name, setName] = useState(""); const [fresh, setFresh] = useState<string | null>(null); const [err, setErr] = useState(""); const [del, setDel] = useState<Tok | null>(null);
  const mint = async (e: React.FormEvent) => { e.preventDefault(); setErr(""); const res = await fetch(`${BP}/api/tokens`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }); const j = await res.json().catch(() => ({})); if (!res.ok) return setErr(j.error ?? "Could not create a token."); track(EVENTS.app_api_token_created); setFresh(j.token); setRows(rs => [j.doc, ...rs]); setName(""); };
  const revoke = async (t: Tok) => { setDel(null); if ((await fetch(`${BP}/api/tokens/${t.id}`, { method: "DELETE" })).ok) setRows(rs => rs.filter(x => x.id !== t.id)); };
  return <SettingsShell title="API access">{user.guest || user.demo ? <NeedAccount what="Creating API tokens" /> : <>
    <p className="ids-muted" style={{ margin: "0 0 12px" }}>Create, list and edit links, QR Codes, Pages and Campaigns from your own code. Send the token as <code>Authorization: Bearer …</code>. <Link href="/developers">Read the API docs</Link>.</p>
    <form onSubmit={mint} className="bl-new__row" style={{ maxWidth: 520 }}><input className="ids-input" aria-label="Token name" placeholder="Token name, e.g. Zapier" value={name} maxLength={40} onChange={e => setName(e.target.value)} /><button className="ids-btn ids-btn--primary">Generate token</button></form>
    {err && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "10px 0 0" }}>{err}</p>}
    {fresh && <div className="bl-fresh" role="status" data-testid="fresh-token"><span>Copy it now, it won't be shown again:</span> <code style={{ overflowWrap: "anywhere" }}>{fresh}</code> <CopyButton text={fresh} /></div>}
    <ul className="cp-links" style={{ marginTop: 16 }} data-testid="tokens">{rows.map(t => <li key={t.id}><div><b>{t.name}</b><div className="ids-muted" style={{ fontSize: 13 }}><code>{t.prefix}</code> · created {new Date(t.createdAt).toLocaleDateString()}{t.lastUsedAt ? ` · last used ${new Date(t.lastUsedAt).toLocaleDateString()}` : " · never used"}</div></div><span /><button type="button" className="iconbtn" aria-label={`Revoke ${t.name}`} onClick={() => setDel(t)}>Revoke</button></li>)}{rows.length === 0 && <li className="ids-muted" style={{ display: "block" }}>No tokens yet.</li>}</ul>
    <Confirm open={!!del} title="Revoke this token?" body={<p>Anything using it stops working immediately.</p>} confirmLabel="Revoke" onCancel={() => setDel(null)} onConfirm={() => del && revoke(del)} /></>}</SettingsShell>;
}
export function BillingSettings() {
  return <SettingsShell title="Plan and billing"><div className="st-plan"><div><p className="st-plan__k">Current plan</p><p className="st-plan__v">Free · open source</p><p className="ids-muted" style={{ margin: 0 }}>Every feature is included: unlimited clicks, up to 300 links, custom back-halves, styled QR Codes, Pages, Campaigns, analytics and the API. There is no paid tier and nothing to bill.</p></div>
    <div><p className="st-plan__k">Next charge</p><p className="st-plan__v">$0</p><p className="ids-muted" style={{ margin: 0 }}>No payment method is stored and none is ever requested.</p></div></div>
    <p style={{ margin: "16px 0 0" }}><Link href="/app/upgrade" className="ids-btn ids-btn--outline">See what Bitly charges for this</Link></p></SettingsShell>;
}

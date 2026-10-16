"use client";
// Bitly-style login / signup: white form column + cream illustration panel.
import Link from "next/link";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { useAuth } from "@/components/useAuth";
import { Mark } from "@/components/Mark";

const GG = <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;
const _AP = <svg width="13" height="15" viewBox="0 0 24 24" aria-hidden><path fill="#111" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.600-.7 3-.7s1.800.7 3 .7 2-1.100 2.800-2.200c.9-1.300 1.200-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.900zM14.100 5.700c.6-.8 1.100-1.900.9-3-.9 0-2.100.6-2.700 1.400-.6.700-1.100 1.800-1 2.900 1 .1 2.100-.5 2.800-1.300z" /></svg>;
const ST = { stroke: "#1d2b3f", strokeWidth: 1.4 } as const;
const doc = (x: number, y: number) => <g key={`${x}${y}`}><rect x={x} y={y} width="22" height="28" rx="2" fill="#fff" {...ST} /><path d={`M${x + 4} ${y + 7} h14 M${x + 4} ${y + 12} h14 M${x + 4} ${y + 17} h10`} stroke="#c9a77a" strokeWidth="2" /></g>;
function ArtLogin() {
  return <svg className="bz-svg" viewBox="614 0 410 594" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <g fill="none" stroke="#2f8fd8" strokeWidth="1.2"><path d="M722 205 a102 102 0 0 1 22 -88" /><path d="M740 255 a100 100 0 0 0 130 6" /><path d="M900 205 a96 96 0 0 0 -30 -82" /><path d="M760 105 a104 104 0 0 1 80 -22" /></g>
    {[[736, 118], [733, 177], [776, 272], [860, 83], [905, 160], [900, 245]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill="#fff" stroke="#1d2b3f" strokeWidth="1.2" />)}
    {doc(740, 138)}{doc(878, 150)}{doc(780, 226)}
    <circle cx="788" cy="127" r="15" fill="#fff" {...ST} /><circle cx="788" cy="127" r="6" fill="none" stroke="#ff7a59" strokeWidth="2.4" /><path d="M788 112 v8" stroke="#ff7a59" strokeWidth="2.4" />
    <circle cx="764" cy="206" r="15" fill="#fff" {...ST} /><rect x="755" y="197" width="18" height="18" rx="3" fill="#1d2b3f" /><path d="M758 212 l6 -11 l6 11z" fill="#f2693b" />
    <circle cx="865" cy="236" r="15" fill="#fff" {...ST} /><text x="865" y="240" textAnchor="middle" fontSize="9.5" fontStyle="italic" fill="#3b82d6" fontFamily="Georgia,serif">Canva</text>
    <path d="M783 266 q-6 -50 14 -66 l34 -4 q32 -2 48 14 l10 54 q-24 8 -50 6 z" fill="#8f35a4" stroke="#1d2b3f" strokeWidth="1.4" />
    <path d="M788 305 l-26 8 q-8 8 4 12 l26 -2 z M824 296 l22 -4 q10 2 6 10 l-24 12 z" fill="#fff" stroke="#1d2b3f" strokeWidth="1.4" />
    <path d="M826 168 q-10 20 -2 46 q30 10 60 -6 q12 -20 6 -48 q-20 -14 -46 0z" fill="#a994e6" stroke="#1d2b3f" strokeWidth="1.4" />
    <circle cx="845" cy="143" r="20" fill="#f3cfae" stroke="#1d2b3f" strokeWidth="1.4" /><path d="M825 140 q4 -26 26 -22 q14 6 14 22 q-10 -12 -22 -10 q-12 2 -18 10z" fill="#1d2b3f" /><circle cx="862" cy="112" r="9" fill="#1d2b3f" />
    <path d="M840 150 q5 5 10 0" stroke="#c0392b" strokeWidth="1.6" fill="none" />
    <circle cx="817" cy="187" r="23" fill="#f26a1b" stroke="#1d2b3f" strokeWidth="1.4" /><circle cx="817" cy="187" r="12" fill="none" stroke="#fff" strokeWidth="3.2" /><path d="M811 177 v20" stroke="#fff" strokeWidth="3.2" />
    <path d="M790 190 q-12 -6 -8 -16 M846 192 q14 -2 18 -14" stroke="#1d2b3f" strokeWidth="1.4" fill="none" />
    <path d="M908 118 l0 12 M902 124 l12 0 M904 120 l8 8 M912 120 l-8 8" stroke="#1d2b3f" strokeWidth="1.2" />
  </svg>;
}
function ArtSignup() {
  return <svg className="bz-svg" viewBox="614 0 410 594" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <path d="M818 141 q38 -10 44 20 q6 40 4 50" stroke="#f58a1f" strokeWidth="2" fill="none" /><path d="M780 295 q40 12 90 -40" stroke="#f58a1f" strokeWidth="2" fill="none" />
    <rect x="645" y="118" width="146" height="187" rx="12" fill="#f58a1f" {...ST} />
    <rect x="652" y="152" width="132" height="146" rx="6" fill="#fff" />
    <text x="692" y="163" fontSize="8" fill="#1d2b3f" fontFamily="Georgia,serif" fontWeight="700">Living Shop</text>
    <rect x="652" y="172" width="64" height="12" rx="2" fill="#fff" {...ST} /><text x="684" y="181" textAnchor="middle" fontSize="5" fill="#1d2b3f">New collection</text>
    <rect x="652" y="192" width="64" height="56" fill="#f58a1f" /><rect x="656" y="212" width="58" height="26" rx="8" fill="#e8651b" /><text x="656" y="200" fontSize="6" fill="#1d2b3f" fontFamily="Georgia,serif">Living room</text>
    <rect x="652" y="250" width="64" height="48" fill="#efe9de" /><path d="M668 292 q4 -30 30 -34 q10 0 8 12 q-8 20 -4 24z" fill="#d8d0c0" /><text x="696" y="259" fontSize="6" fill="#1d2b3f" fontFamily="Georgia,serif">Home decor</text>
    <rect x="663" y="127" width="155" height="26" rx="13" fill="#fff" {...ST} /><circle cx="677" cy="140" r="8" fill="#f58a1f" /><circle cx="677" cy="140" r="3" fill="none" stroke="#fff" strokeWidth="1.6" /><text x="692" y="146" fontSize="14" fontWeight="800" fill="#1d2b3f">bit.ly/SFlivingShop</text>
    <rect x="725" y="188" width="66" height="62" rx="10" fill="#fff" {...ST} />
    {Array.from({ length: 49 }).map((_, i) => ((i * 7 + (i >> 2)) % 3 !== 0) && <rect key={i} x={732 + (i % 7) * 7.2} y={196 + Math.floor(i / 7) * 6.6} width="5" height="5" fill="#1d2b3f" />)}
    <path d="M900 205 q-14 40 -8 115 l108 0 l0 -90 q-4 -40 -40 -62 q-30 -8 -60 37z" fill="#fff" stroke="#1d2b3f" strokeWidth="1.4" />
    <path d="M884 140 q-6 -44 36 -48 q44 2 56 40 q6 40 -6 90 q-30 8 -44 -6 q-26 -10 -42 -76z" fill="#2a2a38" stroke="#1d2b3f" strokeWidth="1.4" />
    <path d="M896 132 q16 -10 36 -4 q16 12 14 44 q-4 24 -22 30 q-22 -2 -30 -26 q-4 -24 2 -44z" fill="#e9b88a" stroke="#1d2b3f" strokeWidth="1.4" />
    <path d="M898 150 q4 -2 8 0 M911 168 q4 2 8 -2 M900 190 q8 4 14 -2" stroke="#1d2b3f" strokeWidth="1.2" fill="none" />
    <path d="M990 262 q-60 20 -112 -10 q-4 -10 6 -12 l56 10 q18 -10 40 -26 q14 8 10 38z" fill="#e9b88a" stroke="#1d2b3f" strokeWidth="1.4" />
    <rect x="860" y="226" width="12" height="22" rx="3" fill="#fff" stroke="#1d2b3f" strokeWidth="1.4" transform="rotate(20 866 237)" />
    <g transform="rotate(-18 832 270)"><rect x="795" y="248" width="76" height="46" rx="3" fill="#f58a1f" stroke="#1d2b3f" strokeWidth="1.4" /><rect x="826" y="256" width="22" height="22" fill="#fff" /></g>
  </svg>;
}
export function AuthScreen({ config, demo, to, signup = false, reset: resetPage = false }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup?: boolean; reset?: boolean }) {
  const a = useAuth({ config, demo, to, signup, reset: resetPage });
  const su = a.mode === "signup", reset = a.mode === "reset";
  return <main className="bz-au">
    <section className="bz-left">
      <Link href="/" className="bz-logo" aria-label="Home"><Mark size={40} />bitlyisdead</Link>
      <form className="bz-form" onSubmit={a.submit(false)}>
        <h1>{reset ? "Reset your password" : su ? "Create your account" : "Log in and start sharing"}</h1>
        <p className="bz-sub">{reset ? "Enter the email you signed up with and we’ll send a reset link." : su ? <>Already have an account? <a href="#" onClick={a.go("signin")}>Log in</a></> : <>Don’t have an account? <a href="#" onClick={a.go("signup")}>Sign up</a></>}</p>
        {!reset && <>
          <button type="button" className="bz-prov" onClick={a.google} disabled={a.busy}>{GG}<span>Continue with Google</span></button>
          <div className="bz-or"><span>OR</span></div></>}
        <label htmlFor="bz-e">{reset ? "Email" : "Email"}</label><input id="bz-e" type="email" required autoComplete="email" value={a.email} onChange={e => a.setEmail(e.target.value)} />
        {!reset && <><label htmlFor="bz-p">Password</label><input id="bz-p" type="password" required minLength={6} autoComplete={su ? "new-password" : "current-password"} value={a.password} onChange={e => a.setPassword(e.target.value)} /></>}
        {!su && !reset && <Link href="/forgot-password" className="bz-fgt">Forgot your password?</Link>}
                <button className="bz-cta" disabled={a.busy}>{reset ? "Reset" : su ? "Create free account" : "Log in"}</button>
        {a.err && <p role="alert" className="bz-err">{a.err}</p>}{a.note && <p role="status" className="bz-ok">{a.note}</p>}
        {!reset && <p className="bz-legal">{su ? "By creating an account, you agree to BitlyIsDead’s " : "By logging in with an account, you agree to BitlyIsDead’s "}<Link href="/terms">Terms of Service</Link>, <Link href="/privacy">Privacy Policy</Link> and <Link href="/acceptable-use">Acceptable Use Policy</Link>.</p>}
        {reset && <p className="bz-legal"><Link href="/login">Back to log in</Link></p>}
        {a.demo && <button type="button" className="bz-demo" onClick={a.useDemo}>Use the demo account</button>}
      </form>
      {!a.configured && <p className="bz-cfg" role="status">Sign-in isn’t configured on this deployment yet.</p>}
    </section>
    <aside className={`bz-right${su ? " su" : ""}`}>{su ? <ArtSignup /> : <ArtLogin />}<p className="bz-cap">{su ? <>Power your links, QR Codes and landing pages, free</> : "Short links, QR Codes and pages that stay yours"}</p></aside>
  </main>;
}

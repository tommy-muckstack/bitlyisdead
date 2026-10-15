import Link from "next/link";
import { site } from "@/site.config";
/** Bitly's Upgrade button leads to a paywall. Ours explains there is nothing to buy and never asks for payment. */
export function Upgrade() {
  return <main className="bl-app" style={{ maxWidth: 820 }}><section className="ids-card bl-new" style={{ textAlign: "center", padding: "40px 28px" }}>
    <p className="nf-k">You're already on the best plan</p><h1 className="ids-h2" style={{ fontSize: 32, margin: "6px 0 10px" }}>There's nothing to upgrade to</h1>
    <p className="ids-muted" style={{ maxWidth: 560, margin: "0 auto 22px", fontSize: 16 }}>BitlyIsDead is free and open source. The features Bitly sells on its Core, Growth and Premium tiers are all switched on for every account, and no payment is ever taken.</p>
    <div className="up-grid">{site.pricing.plans.map(p => <div key={p.name} className="up-card"><b>Bitly {p.name}</b><span>${p.perSeatMonth}/mo</span><small>{p.note}</small></div>)}<div className="up-card up-card--ours"><b>BitlyIsDead</b><span>$0</span><small>everything, forever</small></div></div>
    <div className="tb" style={{ justifyContent: "center", marginTop: 26 }}><Link href="/app" className="ids-btn ids-btn--primary">Back to the app</Link><a className="ids-btn ids-btn--outline" href={site.repo} target="_blank" rel="noreferrer">Star or fork on GitHub</a></div></section></main>;
}

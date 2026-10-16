"use client";
import Link from "next/link";
import { useState } from "react";
import "@/app/bt-pricing.css";

// Prices checked on bitly.com/pages/pricing on 2026-10-15: Free $0 (2 QR Codes, 5 links, 3 back-halves a month); Core $10/mo annual only ($120/yr);
// Growth $29/mo annual ($348/yr) or $35 monthly; Premium $199/mo annual ($2,388/yr) or $300 monthly. Our plan is $0 for all of it.
type P = { n: string; pill?: string; rec?: boolean; d: string; annual: number; monthly: number | null; charge?: string; f: string[]; lead: string; assist?: boolean };
const plans: P[] = [
  { n: "FREE", pill: "With Ads", d: "Try it out for free", annual: 0, monthly: 0, lead: "What’s included:", f: ["2 QR Codes/month", "5 links/month", "2 custom landing pages", "3 custom back-halves/month", "Unlimited clicks & QR Code scans", "QR Code customizations"] },
  { n: "CORE", d: "Unlock powerful data", annual: 10, monthly: null, charge: "Annual charge of $120", lead: "Everything in Free, plus:", f: ["5 QR Codes/month", "100 links/month", "5 custom landing pages", "30 days of click & scan data", "UTM Builder", "Advanced QR Code customizations", "Link & QR Code redirects"], assist: true },
  { n: "GROWTH", rec: true, d: "Create memorable brand experiences", annual: 29, monthly: 35, charge: "Annual charge of $348", lead: "Everything in Core, plus:", f: ["10 QR Codes/month", "500 links/month", "10 custom landing pages", "Complimentary custom domain*", "Branded links", "4 months of click & scan data", "Bulk link & QR Code creation"] },
  { n: "PREMIUM", d: "Scale your connections", annual: 199, monthly: 300, charge: "Annual charge of $2,388", lead: "Everything in Growth, plus:", f: ["200 QR Codes/month", "3,000 links/month", "20 custom landing pages", "1 year of click & scan data", "Custom campaign-level tracking", "City-level and device type click & scan data", "Mobile deep linking"] },
];
const ent = ["Multiple users & group permission management", "At-scale link & QR Code generation", "Advanced performance tracking", "Customized onboarding & priority support", "Dedicated customer success manager", "High-volume API & webhook access", "99.99% uptime", "SSO logins"];
const Ck = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;

export function BtPricing() {
  const [yearly, setYearly] = useState(true);
  return <div className="btp">
    <section className="btp-hero"><h1>Pricing for brands and businesses of all sizes</h1><p>This is what Bitly charges for the features in this app. BitlyIsDead gives you all of them for $0.</p>
      <div className="btp-note"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg><span><strong>Open source</strong>: every plan below is included free. Prices are Bitly’s as of October 2026.</span></div></section>
    <section className="btp-card" id="plans">
      <div className="btp-bar"><div className="btp-tog" role="group" aria-label="Billing period"><button type="button" className={yearly ? "on" : ""} aria-pressed={yearly} onClick={() => setYearly(true)}>Pay annually</button><button type="button" className={yearly ? "" : "on"} aria-pressed={!yearly} onClick={() => setYearly(false)}>Pay Monthly</button></div>
        <span className="btp-save"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M6 4h12l3 5-9 11L3 9z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>Save up to 34% with our annual plans</span></div>
      <div className="btp-plans">{plans.map(p => { const price = yearly ? p.annual : p.monthly; return <article key={p.n} className={p.rec ? "rec" : ""} data-plan={p.n}>
        <header><h3>{p.n}{p.pill && <span>{p.pill}</span>}{p.rec && <span className="r">Recommended</span>}</h3><p>{p.d}</p>
          <div className="btp-price" data-testid={`price-${p.n}`}>{price === null ? <b className="btp-ao">Annual Only</b> : <><b><sup>$</sup>{price}</b><i>/month</i></>}</div><div className="btp-ann">{yearly ? p.charge ?? "" : price === null ? `$${p.annual}/month, billed yearly` : p.annual ? "Billed monthly" : ""}</div>
          <Link className="btp-btn" href="/app">Get Started</Link></header>
        <h4>{p.lead}</h4>
        <ul>{p.f.map(x => <li key={x}><Ck />{x}</li>)}</ul>
        {p.assist && <div className="btp-assist"><span>Bitly Assist: Create links and analyze performance with AI</span><em>New</em></div>}
      </article>; })}</div>
      <div className="btp-ent" id="enterprise"><div><h3>ENTERPRISE</h3><p>Custom number of links, QR Codes, and landing pages</p><div className="btp-cp">Custom Pricing</div><Link className="btp-btn" href="/about#contact">Get Quote</Link></div>
        <div><h4>Everything in Premium, plus:</h4><ul>{ent.map(x => <li key={x}><Ck />{x}</li>)}</ul></div></div>
      <div className="btp-cmp"><h3>Detailed Feature Comparison</h3><Link href="/compare#pricing" className="btp-cmpb">Compare all features<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></Link></div>
      <p className="btp-foot">*Bitly’s complimentary custom domain is on its Growth plan and above; here, custom domains verify by DNS and route on self-hosted deployments.<br />Bitly’s prices are quoted from bitly.com/pages/pricing (October 2026) and may change. BitlyIsDead never charges, stores a payment method or renews anything.</p>
    </section>
  </div>;
}

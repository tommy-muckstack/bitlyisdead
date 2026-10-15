import Link from "next/link";
import "@/app/bt-pricing.css";

type P = { n: string; pill?: string; rec?: boolean; d: string; price: string; per: string; annual?: string; f: string[]; lead: string; assist?: boolean };
const plans: P[] = [
  { n: "FREE", pill: "With Ads", d: "Try it out for free", price: "0", per: "/month", lead: "What’s included:", f: ["1 QR Code", "5 links/month", "2 custom landing pages", "3 custom back-halves/month", "Unlimited clicks & QR Code scans", "QR Code customizations"] },
  { n: "CORE", d: "Unlock powerful data", price: "0", per: "/month", annual: "Annual charge of $0", lead: "Everything in Free, plus:", f: ["5 QR Codes/month", "100 links/month", "5 custom landing pages", "30 days of click & scan data", "UTM Builder", "Advanced QR Code customizations", "Link & QR Code redirects"], assist: true },
  { n: "GROWTH", rec: true, d: "Create memorable brand experiences", price: "0", per: "/month", annual: "Annual charge of $0", lead: "Everything in Core, plus:", f: ["10 QR Codes/month", "500 links/month", "10 custom landing pages", "Complimentary custom domain*", "Branded links", "4 months of click & scan data", "Bulk link & QR Code creation"] },
  { n: "PREMIUM", d: "Scale your connections", price: "0", per: "/month", annual: "Annual charge of $0", lead: "Everything in Growth, plus:", f: ["200 QR Codes/month", "3,000 links/month", "20 custom landing pages", "1 year of click & scan data", "Custom campaign-level tracking", "City-level and device type click & scan data", "Mobile deep linking"] },
];
const ent = ["Multiple users & group permission management", "At-scale link & QR Code generation", "Advanced performance tracking", "Customized onboarding & priority support", "Dedicated customer success manager", "High-volume API & webhook access", "99.99% uptime", "SSO logins"];
const Ck = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;

export function BtPricing() {
  return <div className="btp">
    <section className="btp-hero"><h1>Pricing for brands and businesses of all sizes</h1><p>Connect to your audience with branded links, QR Codes, and landing pages that will get their attention.</p>
      <div className="btp-note"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg><span><strong>New</strong>: Bitly Assist is here—create links and analyze performance with AI, included on Core plans and above.</span></div></section>
    <section className="btp-card" id="plans">
      <div className="btp-bar"><div className="btp-tog"><button type="button" className="on">Pay annually</button><button type="button">Pay Monthly</button></div>
        <span className="btp-save"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M6 4h12l3 5-9 11L3 9z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>Save up to 34% with our annual plans</span></div>
      <div className="btp-plans">{plans.map(p => <article key={p.n} className={p.rec ? "rec" : ""}>
        <header><h3>{p.n}{p.pill && <span>{p.pill}</span>}{p.rec && <span className="r">Recommended</span>}</h3><p>{p.d}</p>
          <div className="btp-price"><b><sup>$</sup>{p.price}</b><i>{p.per}</i></div><div className="btp-ann">{p.annual}</div>
          <Link className="btp-btn" href="/login?mode=signup">Get Started</Link></header>
        <h4>{p.lead}</h4>
        <ul>{p.f.map(x => <li key={x}><Ck />{x}</li>)}</ul>
        {p.assist && <div className="btp-assist"><span>Bitly Assist: Create links and analyze performance with AI</span><em>New</em></div>}
      </article>)}</div>
      <div className="btp-ent"><div><h3>ENTERPRISE</h3><p>Custom number of links, QR Codes, and landing pages</p><div className="btp-cp">Custom Pricing</div><Link className="btp-btn" href="/login">Get Quote</Link></div>
        <div><h4>Everything in Premium, plus:</h4><ul>{ent.map(x => <li key={x}><Ck />{x}</li>)}</ul></div></div>
      <div className="btp-cmp"><h3>Detailed Feature Comparison</h3><a href="#plans" className="btp-cmpb">Compare all features<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></a></div>
      <p className="btp-foot">*Your data stays yours and is never used to train AI models. Enterprise plans include admin controls over AI feature access.<br />**Custom domain registration included with subscription<br />Your purchase may be subject to sales tax and will automatically renew every month or year, depending on the payment plan you’ve chosen.</p>
    </section>
  </div>;
}

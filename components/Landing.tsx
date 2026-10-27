import Link from "next/link";
import { BtPricing } from "@/components/BtPricing";
import { ShortenBox } from "@/components/ShortenBox";
import { Mark } from "@/components/Mark";
import "@/app/landing.css";

// Structure mirrors bitly.com's homepage: promo bar, navy hero with a shorten card, cream bento, KPI row,
// testimonial carousel, use-case cards, big product screenshot and an orange footer. All art is original.
const Arr = () => <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Logo = ({ c = "#F36600" }: { c?: string }) => <span className="bz-logo" style={{ color: c }}><Mark size={34} />bitlyisdead</span>;
const Chk = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="7" fill="none" stroke="#F36600" strokeWidth="1.4" /><path d="M5 8.3l2 2 4-4.4" fill="none" stroke="#F36600" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const brands = ["SHORT LINKS", "QR CODES", "PAGES", "CAMPAIGNS", "ANALYTICS", "API"];
const kpis = [["$0", "Per month, forever", "#3d7fe0"], ["300", "Links per account, no monthly cap", "#F36600"], ["∞", "Clicks & scans counted", "#e0541d"], ["30 days", "Of daily click history", "#e8543c"], ["Apache-2.0", "Open source: fork it, change it, ship it", ""]];
const quotes = [["Paste a link, pick a back-half, add UTMs, and share. Every click is counted by day, referrer, device, browser, country and city — bots filtered out.", "SHORT LINKS", "Create, tag, filter, hide, edit and bulk-manage"], ["Design a QR Code with your colours, pattern, frame and logo, download it as PNG, SVG or JPEG, and change its destination later without reprinting.", "QR CODES", "Scans counted apart from clicks"], ["Put all your links on one page with a theme and blocks, publish it at a public URL, and watch views and clicks per button.", "PAGES & CAMPAIGNS", "Group links with shared UTMs and rolled-up analytics"]];
const cases = [["Newsletters", "Short, tagged links for every send, with referrers and clicks per day", "#F7C9A6"], ["Print & packaging", "QR Codes you can restyle and repoint without a reprint", "#CFE3F5"], ["Social profiles", "One link-in-bio page for everything you post", "#F6E1A6"], ["Events", "A campaign per event with shared UTMs and one dashboard", "#D9D2F2"]];
const GH = "https://github.com/tommy-muckstack/bitlyisdead";
const foot: [string, [string, string][]][] = [
  ["Products", [["URL Shortener", "/app/links/new"], ["QR Code Generator", "/app/qr/new"], ["Analytics", "/app/analytics"], ["Pages (link-in-bio)", "/app/pages"], ["UTM Campaigns", "/app/campaigns"], ["Custom domains", "/app/domains"], ["Features", "/#features"], ["Pricing", "/pricing"]]],
  ["Solutions", [["Newsletters", "/#solutions"], ["Print & packaging", "/#solutions"], ["Social profiles", "/#solutions"], ["Events", "/#solutions"], ["Compare with Bitly", "/compare"]]],
  ["Resources", [["Help Center", "/help"], ["Developers (API)", "/developers"], ["Source code", GH], ["Report a bug", GH + "/issues"], ["Other IsDead apps", "https://yourappisdead.com"]]],
  ["Legal", [["Privacy Policy", "/privacy"], ["Cookie Policy", "/privacy#cookies"], ["Terms of Service", "/terms"], ["Acceptable Use Policy", "/acceptable-use"], ["License (Apache-2.0)", GH + "/blob/main/LICENSE"]]],
  ["Company", [["About", "/about"], ["What’s new", "/about#whats-new"], ["Contact", "/about#contact"], ["Accessibility Statement", "/accessibility"]]]];

export function Landing({ page }: { page?: "pricing" } = {}) {
  return <div className={"bz" + (page === "pricing" ? " is-pr" : "")}>
    <div className="bz-promo"><span className="bz-new">New</span><span>QR Code designer, link-in-bio Pages, Campaigns and an API are live, all free. <Link href="/about#whats-new">See what’s new →</Link></span></div>
    <section className="bz-hero">
      <nav className="bz-nav"><Link href="/" className="bz-navlogo"><Logo /></Link>
        <div className="bz-links"><Link href="/#features">Platform</Link><Link href="/#solutions">Solutions</Link><Link href="/pricing">Pricing</Link><Link href="/developers">Developers</Link><Link href="/help">Help</Link></div>
        <div className="bz-navcta"><Link href="/login">Log in</Link><Link className="bz-ol" href="/pricing#enterprise">Get a Quote</Link><Link className="bz-wh" href="/login?mode=signup">Sign up Free</Link></div></nav>
      <h1>Understand what clicks with your audience</h1>
      <p className="bz-lede">Create, share, and track short links and QR Codes with an open-source tool. Find what’s resonating and scale it into bigger reach, more clicks, and more sales.</p>
      <ShortenBox />
      <div className="bz-plan"><span>Sign up for free. Every account includes:</span><ul><li><Chk />300 short links, no monthly cap</li><li><Chk />Custom back-halves</li><li><Chk />Unlimited link clicks</li></ul></div>
      <div className="bz-brands">{brands.map(b => <span key={b}>{b}</span>)}</div>
    </section>

    <section className="bz-link" id="features">
      <div className="bz-star"><svg width="64" height="64" viewBox="0 0 64 64" aria-hidden><path d="M32 4l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 23l18-2z" fill="#F36600" stroke="#031F39" strokeWidth="2" strokeLinejoin="round" /><circle cx="32" cy="31" r="9" fill="#fff" /></svg></div>
      <h2>Link your marketing with BitlyIsDead</h2><p>Use the URL shortener and QR Code generator to create links and QR Codes in seconds, then track every click and scan in one place.</p>
      <div className="bz-btns"><Link className="bz-navy" href="/login?mode=signup">Get started for free <Arr /></Link><Link className="bz-cream" href="/pricing">See pricing</Link></div>
      <div className="bz-bento">
        <article className="bz-b bz-b--url"><p className="bz-k"><i className="bz-ic" />URL SHORTENER</p><h3>Short links that do more</h3><p>Customize, share, and track your links — every click tells you more about what your audience wants.</p><div className="bz-media bz-media--url"><div className="bz-chip"><i />bit.ly/4xc5M</div><div className="bz-pop"><b>?utm_medium=social <u>+ Add</u></b><b>https://example.com/land… <u>↪ Redirect</u></b><b>Dynamic routing</b></div></div></article>
        <article className="bz-b bz-b--qr"><p className="bz-k"><i className="bz-ic bz-ic--qr" />QR CODES</p><h3>Codes you can edit and track</h3><p>Dynamic QR Codes for print and packaging — update the destination anytime, no reprint needed.</p><div className="bz-media bz-media--qr"><b>QR Code Destination <u>↪ Redirect</u></b><b>Code expiration <i className="bz-sw" /></b><b>Total scans <em>1,200</em></b><b>Weekly scan rate <em className="g">↗ +23%</em></b></div></article>
        <article className="bz-b bz-b--an"><div className="bz-an__t"><p className="bz-k"><i className="bz-ic bz-ic--bar" />ANALYTICS</p><h3>See every click and scan</h3><p>Real-time performance for every link and code, side by side.</p></div><div className="bz-an__m"><span>✦ Analyze with AI</span></div></article>
      </div>
    </section>

    <section className="bz-kpi"><h2>Real numbers, no fine print</h2>
      <div className="bz-kpis">{kpis.map(([n, l, c]) => <div key={n}><i style={{ background: c ? `${c}22` : "transparent", borderColor: c || "transparent" }} /><b>{n}</b><span>{l}</span></div>)}</div></section>

    <section className="bz-say"><h2>What you get, with nothing held back</h2>
      <div className="bz-cards">{quotes.concat(quotes.slice(0, 1)).map(([q, n, r], i) => <article key={i}><span className="bz-qm">✓</span><p>{q}</p><footer><b>{n}</b><small>{r}</small></footer></article>)}</div>
      <div className="bz-dots"><i /><i className="on" /><i /></div></section>

    <section className="bz-use" id="solutions"><h2>Made for the links you actually share</h2>
      <div className="bz-ucards">{cases.map(([t, d, bg]) => <article key={t}><span className="bz-tag">{t}</span><h3>{d}</h3><Link href="/app">Try it →</Link><div className="bz-ill" style={{ background: bg }}><i /><b /></div></article>)}</div>
      <div className="bz-dots bz-dots--n"><i className="on" /><i /><i /><i /><i /></div></section>

    {page === "pricing" && <BtPricing />}
    <section className="bz-more"><div className="bz-more__in"><h2>More than a link shortener</h2><p>Knowing how your clicks and scans are performing should be as easy as making them. Track, analyze, and optimize all your connections in one place.</p>
      <div className="bz-btns"><Link className="bz-navy" href="/login?mode=signup">Get started for free <Arr /></Link><Link className="bz-cream" href="/pricing">See pricing</Link></div>
      <div className="bz-shot"><div className="bz-app"><aside><i /><i /><i /><i /><i /><i /></aside><main><div className="bz-app__bar" /><div className="bz-app__tabs"><span>Short link</span><span>QR Code</span></div><div className="bz-app__box"><b>Quick create: Short link</b><span>Enter your destination URL</span><i /><em>Create your link</em></div><div className="bz-app__chart"><b>Total engagements, last 7 days</b><strong>1,199</strong><svg viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0 60 C60 55 90 20 130 30 S200 70 250 50 S340 30 400 55 V80 H0z" fill="#dfe6fb" stroke="#4a63d8" strokeWidth="2" /></svg></div></main></div></div></div></section>

    <footer className="bz-ft"><div className="bz-ft__cols">{foot.map(([h, ls]) => <div key={h}><h3>{h}</h3>{ls.map(([l, href]) => href.startsWith("http") ? <a key={l} href={href} target="_blank" rel="noreferrer">{l}</a> : <Link key={l} href={href}>{l}</Link>)}</div>)}</div>
      <div className="bz-ft__bar"><Logo c="#031F39" /><p>© 2026 BitlyIsDead | An open-source project handmade in the cloud. Not affiliated with Bitly, Inc. Bitly is a trademark of its owner. <a href={GH}>GitHub</a></p></div></footer>
  </div>;
}

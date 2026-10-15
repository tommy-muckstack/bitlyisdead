import Link from "next/link";
import { ShortenBox } from "@/components/ShortenBox";
import "@/app/landing.css";

// Structure mirrors bitly.com's homepage: promo bar, navy hero with a shorten card, cream bento, KPI row,
// testimonial carousel, use-case cards, big product screenshot and an orange footer. All art is original.
const Arr = () => <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Logo = ({ c = "#F36600" }: { c?: string }) => <span className="bz-logo" style={{ color: c }}>bitlyisdead</span>;
const Chk = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="7" fill="none" stroke="#F36600" strokeWidth="1.4" /><path d="M5 8.3l2 2 4-4.4" fill="none" stroke="#F36600" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const Car = () => <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden style={{ marginLeft: 6 }}><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;
const brands = ["Curology", "NOVASOL", "RAD POWER BIKES", "bowl & kettle", "The New York Times", "SMALLS"];
const kpis = [["3M+", "Customers", "#3d7fe0"], ["2B+", "Links & QR Codes created annually", "#F36600"], ["100B+", "Clicks & scans annually", "#e0541d"], ["3,399+", "Connected apps & workflows", "#e8543c"], ["99.97%", "Uptime", ""]];
const quotes = [["“Upon implementing the tool, we were able to know where our audience was coming from instantly. That allowed us to double down on what was working and save time and resources in places that was not working.”", "TIM RYAN", "President, Arcphor"], ["“It is dead simple to use. We create a lot of links, and need something fast & easy.”", "KRAIG G.", "Small-Business (50 or fewer emp.) Financial Services Company"], ["“It is easy to use, fast and reliable. It is more than a URL shortener, although that is what we use it for most.”", "ANKIT D.", "Digital Marketing Specialist"]];
const cases = [["Retail", "Attract customers and keep loyal shoppers coming back", "#F7C9A6"], ["Consumer Packaged Goods", "Thriving brands start with raving fans and powerful connections", "#CFE3F5"], ["Hospitality", "Delight your guests and anticipate their every need with easy-to-use digital solutions", "#F6E1A6"], ["Media & Entertainment", "Turn newcomers into diehard fans by capturing their attention at the perfect time", "#D9D2F2"]];
const foot: [string, string[]][] = [["Why Bitly?", ["Integration Library", "Enterprise Class", "Pricing"]], ["Products", ["URL Shortener", "QR Code Generator", "2D Barcodes", "Analytics", "Pages", "Features", "Link-in-bio", "Branded Links", "Mobile Links", "UTM Campaigns", "Digital Business Cards", "Dynamic Routing"]], ["Solutions", ["Retail", "Consumer Packaged Goods", "Hospitality", "Media & Entertainment", "Tech Software & Hardware", "Healthcare", "Insurance", "Financial Services", "Professional Services", "Education"]], ["Resources", ["Blog", "Guides & eBooks", "Videos & Webinars", "Customer Stories", "QR Code Inspiration Gallery", "Developers", "Apps and Integrations", "Help Center", "Trust Center", "Browser Extension", "Mobile App"]], ["Legal", ["Privacy Policy", "Cookie Policy", "Terms of Service", "Acceptable Use Policy", "Code of Conduct", "Transparency Report", "Patents"]], ["Company", ["About", "Careers", "Inclusion", "Partners", "Press", "Contact", "Reviews", "Accessibility Report", "Accessibility Statement"]]];

export function Landing() {
  return <div className="bz">
    <div className="bz-promo"><span className="bz-new">New</span><span>The Click Expectation Report is here! Explore new research on what consumers want vs. what they get. <Link href="/pricing">Read the report →</Link></span></div>
    <section className="bz-hero">
      <nav className="bz-nav"><Link href="/" className="bz-navlogo"><Logo /></Link>
        <div className="bz-links"><button>Platform<Car /></button><button>AI<Car /></button><button>Solutions<Car /></button><Link href="/pricing">Pricing</Link><button>Resources<Car /></button></div>
        <div className="bz-navcta"><Link href="/login">Log in</Link><Link className="bz-ol" href="/login">Get a Quote</Link><Link className="bz-wh" href="/login?mode=signup">Sign up Free</Link></div></nav>
      <h1>Understand what clicks with your audience</h1>
      <p className="bz-lede">Create, share, and track short links and QR Codes with an open-source tool. Find what’s resonating and scale it into bigger reach, more clicks, and more sales.</p>
      <ShortenBox />
      <div className="bz-plan"><span>Sign up for free. Your free plan includes:</span><ul><li><Chk />5 short links/month</li><li><Chk />3 custom back-halves/month</li><li><Chk />Unlimited link clicks</li></ul></div>
      <div className="bz-brands">{brands.map(b => <span key={b}>{b}</span>)}</div>
    </section>

    <section className="bz-link">
      <div className="bz-star"><svg width="64" height="64" viewBox="0 0 64 64" aria-hidden><path d="M32 4l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 23l18-2z" fill="#F36600" stroke="#031F39" strokeWidth="2" strokeLinejoin="round" /><circle cx="32" cy="31" r="9" fill="#fff" /></svg></div>
      <h2>Link your marketing with Bitly</h2><p>Use our URL shortener and QR Code generator to create branded links and QR Codes in seconds, then track every click and scan in one place.</p>
      <div className="bz-btns"><Link className="bz-navy" href="/login?mode=signup">Get started for free <Arr /></Link><Link className="bz-cream" href="/pricing">Get a Quote</Link></div>
      <div className="bz-bento">
        <article className="bz-b bz-b--url"><p className="bz-k"><i className="bz-ic" />URL SHORTENER</p><h3>Short links that do more</h3><p>Customize, share, and track your links — every click tells you more about what your audience wants.</p><div className="bz-media bz-media--url"><div className="bz-chip"><i />bit.ly/4xc5M</div><div className="bz-pop"><b>?utm_medium=social <u>+ Add</u></b><b>https://example.com/land… <u>↪ Redirect</u></b><b>Dynamic routing</b></div></div></article>
        <article className="bz-b bz-b--qr"><p className="bz-k"><i className="bz-ic bz-ic--qr" />QR CODES</p><h3>Codes you can edit and track</h3><p>Dynamic QR Codes for print and packaging — update the destination anytime, no reprint needed.</p><div className="bz-media bz-media--qr"><b>QR Code Destination <u>↪ Redirect</u></b><b>Code expiration <i className="bz-sw" /></b><b>Total scans <em>1,200</em></b><b>Weekly scan rate <em className="g">↗ +23%</em></b></div></article>
        <article className="bz-b bz-b--an"><div className="bz-an__t"><p className="bz-k"><i className="bz-ic bz-ic--bar" />ANALYTICS</p><h3>See every click and scan</h3><p>Real-time performance for every link and code, side by side.</p></div><div className="bz-an__m"><span>✦ Analyze with AI</span></div></article>
      </div>
    </section>

    <section className="bz-kpi"><h2>Adopted and loved by millions of users for over a decade</h2>
      <div className="bz-kpis">{kpis.map(([n, l, c]) => <div key={n}><i style={{ background: c ? `${c}22` : "transparent", borderColor: c || "transparent" }} /><b>{n}</b><span>{l}</span></div>)}</div></section>

    <section className="bz-say"><h2>What our customers are saying</h2>
      <div className="bz-cards">{quotes.concat(quotes.slice(0, 1)).map(([q, n, r], i) => <article key={i}><span className="bz-qm">❝</span><p>{q}</p><footer><b>{n}</b><small>{r}</small></footer></article>)}</div>
      <div className="bz-dots"><i /><i className="on" /><i /></div></section>

    <section className="bz-use"><h2>See how other businesses use Bitly</h2>
      <div className="bz-ucards">{cases.map(([t, d, bg]) => <article key={t}><span className="bz-tag">{t}</span><h3>{d}</h3><Link href="/login">Read more →</Link><div className="bz-ill" style={{ background: bg }}><i /><b /></div></article>)}</div>
      <div className="bz-dots bz-dots--n"><i className="on" /><i /><i /><i /><i /></div></section>

    <section className="bz-more"><div className="bz-more__in"><h2>More than a link shortener</h2><p>Knowing how your clicks and scans are performing should be as easy as making them. Track, analyze, and optimize all your connections in one place.</p>
      <div className="bz-btns"><Link className="bz-navy" href="/login?mode=signup">Get started for free <Arr /></Link><Link className="bz-cream" href="/pricing">Get a Quote</Link></div>
      <div className="bz-shot"><div className="bz-app"><aside><i /><i /><i /><i /><i /><i /></aside><main><div className="bz-app__bar" /><div className="bz-app__tabs"><span>Short link</span><span>QR Code</span></div><div className="bz-app__box"><b>Quick create: Short link</b><span>Enter your destination URL</span><i /><em>Create your link</em></div><div className="bz-app__chart"><b>Total engagements, last 7 days</b><strong>1,199</strong><svg viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0 60 C60 55 90 20 130 30 S200 70 250 50 S340 30 400 55 V80 H0z" fill="#dfe6fb" stroke="#4a63d8" strokeWidth="2" /></svg></div></main></div></div></div></section>

    <footer className="bz-ft"><div className="bz-ft__cols">{foot.map(([h, ls]) => <div key={h}><h3>{h}</h3>{ls.map(l => <Link key={l} href="/login">{l}</Link>)}</div>)}</div>
      <div className="bz-ft__bar"><Logo c="#031F39" /><p>© 2026 BitlyIsDead | An open-source project handmade in the cloud. Not affiliated with Bitly, Inc. <a href="https://github.com/tommy-muckstack/bitlyisdead">GitHub</a></p><div className="bz-soc">{["f", "in", "◎", "X", "▶", "r"].map(s => <i key={s}>{s}</i>)}</div><div className="bz-badges"><i>GDPR</i><i>CCPA</i><i>SOC 2</i></div><span className="bz-lang">🌐 EN ⌄</span></div></footer>
  </div>;
}

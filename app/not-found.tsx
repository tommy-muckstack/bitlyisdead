import Link from "next/link";
import { Mark } from "@/components/Mark";
export const metadata = { title: "Page not found" };
/** Branded 404, like Bitly's "ERROR 404 – PAGE NOT FOUND" (original copy and art). */
export default function NotFound() {
  return <main className="nf"><Link href="/" className="nf-logo" aria-label="Home"><Mark size={40} />bitlyisdead</Link>
    <p className="nf-k">Error 404 · Page not found</p>
    <h1>This page took a wrong turn.</h1>
    <p className="nf-p">The address may be mistyped, or the page was moved or deleted. If you followed a short link, it may have been turned off by its owner.</p>
    <div className="nf-btns"><Link href="/" className="nf-a">Back to the homepage</Link><Link href="/app" className="nf-b">Open the app</Link></div>
    <svg className="nf-art" viewBox="0 0 320 120" aria-hidden><path d="M0 100 Q60 60 120 100 T240 100 T360 100" fill="none" stroke="#F36600" strokeWidth="3" strokeDasharray="8 8" /><circle cx="60" cy="96" r="6" fill="#031F39" /><circle cx="200" cy="96" r="6" fill="#031F39" /><path d="M292 90 l-10 -36 l20 0z" fill="#F36600" /><text x="150" y="40" textAnchor="middle" fontSize="44" fontWeight="800" fill="#031F39" fontFamily="system-ui">404</text></svg>
  </main>;
}

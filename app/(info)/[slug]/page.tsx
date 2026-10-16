import Link from "next/link";
import { notFound } from "next/navigation";
import { Mark } from "@/components/Mark";
import { INFO } from "@/lib/info";
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(INFO).map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const p = INFO[(await params).slug]; return p ? { title: p.title, description: p.lede } : {}; }
/** Small original marketing/legal pages (help, privacy, terms, acceptable use, about, accessibility). */
export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = INFO[(await params).slug]; if (!p) notFound();
  return <main className="dv"><Link href="/" className="nf-logo" style={{ marginBottom: 8 }}><Mark size={34} />bitlyisdead</Link>
    <h1>{p.title}</h1><p className="dv-lede">{p.lede}</p>
    {p.sections.map(s => <section key={s.h} id={s.id}><h2>{s.h}</h2>{s.p.map((t, i) => <p key={i}>{t}</p>)}{s.li && <ul>{s.li.map(x => <li key={x}>{x}</li>)}</ul>}</section>)}
    <p className="ids-muted" style={{ marginTop: 32 }}>Last updated 15 October 2026 · <Link href="/">Home</Link> · <Link href="/app">Open the app</Link></p></main>;
}

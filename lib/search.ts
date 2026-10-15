// Global search across links (and the QR Code / Page collections once they exist). Case-insensitive, title/destination/code/tags.
import { listLinks, matchesLink } from "@/lib/linkstore";
import { hostOf } from "@/lib/links";
export type Hit = { kind: "link" | "qr" | "page"; id: string; title: string; sub: string; href: string };
export type Matcher = (ownerId: string, q: string, demo: boolean) => Promise<Hit[]>;
const matchers: Matcher[] = [async (ownerId, q, demo) => (await listLinks(ownerId, demo)).filter(l => matchesLink(l, q)).slice(0, 8).map(l => ({ kind: "link" as const, id: l.code, title: l.title || hostOf(l.url), sub: `/s/${l.code} · ${l.url}`, href: `/app/l/${l.code}` }))];
export const addMatcher = (m: Matcher) => { matchers.push(m); };
export async function search(ownerId: string, q: string, demo: boolean): Promise<Hit[]> { const all = await Promise.all(matchers.map(m => m(ownerId, q, demo))); return all.flat().slice(0, 12); }

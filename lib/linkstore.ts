// Server-side storage for short links (lib/store.ts → JSON files in dev, Firestore in production, same shape).
import { getDoc, putDoc, delDoc } from "@/lib/store";
import { genCode, validateBackHalf, validateTarget, recordVisit, emptyStats, demoLinks, normalizeLink, cleanTags, isLive, LIMITS, type Link } from "@/lib/links";
const chain = new Map<string, Promise<unknown>>();
export function locked<T>(key: string, fn: () => Promise<T>): Promise<T> { const prev = chain.get(key) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(key, next.catch(() => {})); return next; }
type Index = { codes: string[] };
const idxKey = (owner: string) => owner;
export async function getLink(code: string): Promise<Link | null> { const l = await getDoc<Link>("links", code); return l ? normalizeLink(l) : null; }
/** Every link of an owner, newest first. Reads run in parallel (one doc per link) so a 100-link account loads in one round-trip's worth of latency. */
export async function listLinks(ownerId: string, demo = false): Promise<Link[]> {
  let idx = await getDoc<Index>("owners", idxKey(ownerId));
  if (!idx && demo) { const seed = demoLinks(ownerId); await Promise.all(seed.map(l => putDoc("links", l.code, l))); idx = { codes: seed.map(l => l.code) }; await putDoc("owners", idxKey(ownerId), idx); }
  const docs = await Promise.all((idx?.codes ?? []).map(getLink));
  return docs.filter((l): l is Link => !!l && l.ownerId === ownerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export type CreateInput = { url: string; title?: string; backHalf?: string; expiresAt?: string | null; tags?: string[]; campaignId?: string | null; qrId?: string | null };
export async function createLink(ownerId: string, input: CreateInput, ownHosts: string[]): Promise<{ link?: Link; error?: string }> {
  const t = validateTarget(input.url, ownHosts); if (!t.url) return { error: t.error };
  const back = (input.backHalf ?? "").trim(); if (back) { const bad = validateBackHalf(back); if (bad) return { error: bad }; }
  let exp: string | null = null; if (input.expiresAt) { const d = new Date(input.expiresAt); if (isNaN(d.getTime()) || d.getTime() < Date.now()) return { error: "The expiry must be in the future." }; exp = d.toISOString(); }
  return locked("owner:" + ownerId, async () => {
    const idx = (await getDoc<Index>("owners", idxKey(ownerId))) ?? { codes: [] }; if (idx.codes.length >= LIMITS.perUser) return { error: `You've reached ${LIMITS.perUser} links. Delete some to make more.` };
    let code = back;
    if (code) { const [a, b] = await Promise.all([getLink(code), code === code.toLowerCase() ? null : getLink(code.toLowerCase())]); if (a || b) return { error: "That back-half is taken." }; }
    else { const cands = Array.from({ length: 6 }, (_, i) => genCode(i < 4 ? 6 : 8)); const taken = await Promise.all(cands.map(getLink)); code = cands.find((_, i) => !taken[i]) ?? ""; if (!code) return { error: "Couldn't find a free code. Try again." }; }
    const link = normalizeLink({ code, ownerId, url: t.url!, title: (input.title ?? "").trim().slice(0, LIMITS.title), createdAt: new Date().toISOString(), expiresAt: exp, custom: !!back, tags: cleanTags(input.tags), campaignId: input.campaignId ?? null, qrId: input.qrId ?? null, stats: emptyStats() });
    await Promise.all([putDoc("links", code, link), putDoc("owners", idxKey(ownerId), { codes: [code, ...idx.codes] })]); return { link };
  });
}
export type Patch = { url?: string; title?: string; disabled?: boolean; hidden?: boolean; expiresAt?: string | null; tags?: string[]; campaignId?: string | null; qrId?: string | null };
export const updateLink = (ownerId: string, code: string, patch: Patch, ownHosts: string[]) => locked("link:" + code, async (): Promise<{ link?: Link; error?: string }> => {
  const l = await getLink(code); if (!l || l.ownerId !== ownerId) return { error: "Not found" };
  if (patch.url !== undefined) { const t = validateTarget(patch.url, ownHosts); if (!t.url) return { error: t.error }; l.url = t.url; }
  if (patch.title !== undefined) l.title = String(patch.title).trim().slice(0, LIMITS.title);
  if (patch.disabled !== undefined) l.disabled = !!patch.disabled;
  if (patch.hidden !== undefined) l.hidden = !!patch.hidden;
  if (patch.tags !== undefined) l.tags = cleanTags(patch.tags);
  if (patch.campaignId !== undefined) l.campaignId = patch.campaignId ? String(patch.campaignId).slice(0, 40) : null;
  if (patch.qrId !== undefined) l.qrId = patch.qrId ? String(patch.qrId).slice(0, 40) : null;
  if (patch.expiresAt !== undefined) { if (patch.expiresAt === null) l.expiresAt = null; else { const d = new Date(patch.expiresAt); if (isNaN(d.getTime())) return { error: "Bad expiry date" }; l.expiresAt = d.toISOString(); } }
  await putDoc("links", code, l); return { link: l };
});
export const deleteLink = (ownerId: string, code: string) => locked("owner:" + ownerId, async () => {
  const l = await getLink(code); if (!l || l.ownerId !== ownerId) return false; await delDoc("links", code);
  const idx = await getDoc<Index>("owners", idxKey(ownerId)); if (idx) await putDoc("owners", idxKey(ownerId), { codes: idx.codes.filter(c => c !== code) }); return true;
});
/** Look up a code for redirecting and count the visit atomically. Returns the link (so the caller can decide live/expired). */
export const visit = (code: string, v: { ua: string; referer: string | null; ownHost?: string; scan?: boolean; country?: string | null; city?: string | null }) => locked("link:" + code, async () => {
  const l = await getLink(code); if (!l) return null;
  if (isLive(l)) { recordVisit(l.stats, v); await putDoc("links", code, l); } return l;
});
/** After a guest signs in, their index doc moves to the account (store.adoptGuestDocs); the link docs still carry the guest id, so re-own them. */
export async function adoptLinks(fromId: string, toId: string): Promise<number> {
  const idx = await getDoc<Index>("owners", idxKey(toId)); if (!idx) return 0; let n = 0;
  await Promise.all(idx.codes.map(async c => { const l = await getLink(c); if (l && l.ownerId === fromId) { l.ownerId = toId; await putDoc("links", c, l); n++; } }));
  return n;
}
/** Case-insensitive match on title, destination, short code and tags (what Bitly's search bar covers). */
export const matchesLink = (l: Link, q: string) => { const s = q.trim().toLowerCase(); return !s || [l.title, l.url, l.code, ...l.tags].some(x => x.toLowerCase().includes(s)); };

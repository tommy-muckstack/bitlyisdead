// Server-side storage for short links (lib/store.ts → JSON files in dev; swap for Firestore in production, same shape).
import { getDoc, putDoc, delDoc } from "@/lib/store";
import { genCode, validateBackHalf, validateTarget, recordVisit, emptyStats, demoLinks, LIMITS, type Link } from "@/lib/links";
const chain = new Map<string, Promise<unknown>>();
function locked<T>(key: string, fn: () => Promise<T>): Promise<T> { const prev = chain.get(key) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(key, next.catch(() => {})); return next; }
type Index = { codes: string[] };
const idxKey = (owner: string) => owner;
export const getLink = (code: string) => getDoc<Link>("links", code);
export async function listLinks(ownerId: string, demo = false): Promise<Link[]> {
  let idx = await getDoc<Index>("owners", idxKey(ownerId));
  if (!idx && demo) { for (const l of demoLinks(ownerId)) await putDoc("links", l.code, l); idx = { codes: demoLinks(ownerId).map(l => l.code) }; await putDoc("owners", idxKey(ownerId), idx); }
  const out: Link[] = []; for (const c of idx?.codes ?? []) { const l = await getLink(c); if (l && l.ownerId === ownerId) out.push(l); }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function createLink(ownerId: string, input: { url: string; title?: string; backHalf?: string; expiresAt?: string | null }, ownHosts: string[]): Promise<{ link?: Link; error?: string }> {
  const t = validateTarget(input.url, ownHosts); if (!t.url) return { error: t.error };
  const back = (input.backHalf ?? "").trim(); if (back) { const bad = validateBackHalf(back); if (bad) return { error: bad }; }
  let exp: string | null = null; if (input.expiresAt) { const d = new Date(input.expiresAt); if (isNaN(d.getTime()) || d.getTime() < Date.now()) return { error: "The expiry must be in the future." }; exp = d.toISOString(); }
  return locked("owner:" + ownerId, async () => {
    const idx = (await getDoc<Index>("owners", idxKey(ownerId))) ?? { codes: [] }; if (idx.codes.length >= LIMITS.perUser) return { error: `You've reached ${LIMITS.perUser} links. Delete some to make more.` };
    let code = back; if (code) { if (await getLink(code) || await getLink(code.toLowerCase())) return { error: "That back-half is taken." }; } else { for (let i = 0; i < 8; i++) { const c = genCode(i < 5 ? 6 : 8); if (!(await getLink(c))) { code = c; break; } } if (!code) return { error: "Couldn't find a free code. Try again." }; }
    const link: Link = { code, ownerId, url: t.url!, title: (input.title ?? "").trim().slice(0, LIMITS.title) || "", createdAt: new Date().toISOString(), expiresAt: exp, disabled: false, stats: emptyStats() };
    await putDoc("links", code, link); await putDoc("owners", idxKey(ownerId), { codes: [code, ...idx.codes] }); return { link };
  });
}
export const updateLink = (ownerId: string, code: string, patch: { url?: string; title?: string; disabled?: boolean; expiresAt?: string | null }, ownHosts: string[]) => locked("link:" + code, async (): Promise<{ link?: Link; error?: string }> => {
  const l = await getLink(code); if (!l || l.ownerId !== ownerId) return { error: "Not found" };
  if (patch.url !== undefined) { const t = validateTarget(patch.url, ownHosts); if (!t.url) return { error: t.error }; l.url = t.url; }
  if (patch.title !== undefined) l.title = String(patch.title).trim().slice(0, LIMITS.title);
  if (patch.disabled !== undefined) l.disabled = !!patch.disabled;
  if (patch.expiresAt !== undefined) { if (patch.expiresAt === null) l.expiresAt = null; else { const d = new Date(patch.expiresAt); if (isNaN(d.getTime())) return { error: "Bad expiry date" }; l.expiresAt = d.toISOString(); } }
  await putDoc("links", code, l); return { link: l };
});
export const deleteLink = (ownerId: string, code: string) => locked("owner:" + ownerId, async () => {
  const l = await getLink(code); if (!l || l.ownerId !== ownerId) return false; await delDoc("links", code);
  const idx = await getDoc<Index>("owners", idxKey(ownerId)); if (idx) await putDoc("owners", idxKey(ownerId), { codes: idx.codes.filter(c => c !== code) }); return true;
});
/** Look up a code for redirecting and count the visit atomically. Returns the link (so the caller can decide live/expired). */
export const visit = (code: string, v: { ua: string; referer: string | null; ownHost?: string }) => locked("link:" + code, async () => {
  const l = await getLink(code); if (!l) return null; const { isLive } = await import("@/lib/links");
  if (isLive(l)) { recordVisit(l.stats, v); await putDoc("links", code, l); } return l;
});

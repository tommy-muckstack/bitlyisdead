// Per-owner collections (QR Codes, Pages, Campaigns, Domains): one doc per item in `<col>` plus an index doc per owner in `<col>_idx`.
// The index is keyed by the owner id, so store.adoptGuestDocs() moves it on sign-in; adoptOwned() then re-owns the items.
import { getDoc, putDoc, delDoc } from "@/lib/store";
import { locked } from "@/lib/linkstore";
import crypto from "node:crypto";
type Idx = { ids: string[] };
export type Owned = { id: string; ownerId: string; createdAt: string };
export const newId = (len = 10) => crypto.randomBytes(12).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, len);
export async function listOwned<T extends Owned>(col: string, ownerId: string): Promise<T[]> {
  const idx = await getDoc<Idx>(col + "_idx", ownerId); const docs = await Promise.all((idx?.ids ?? []).map(id => getDoc<T>(col, id)));
  const out: T[] = []; for (const d of docs) if (d && d.ownerId === ownerId) out.push(d); return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getOwned<T extends Owned>(col: string, ownerId: string, id: string): Promise<T | null> { const d = await getDoc<T>(col, id); return d && d.ownerId === ownerId ? d : null; }
export const addOwned = <T extends Owned>(col: string, doc: T, max = 300) => locked(`${col}:${doc.ownerId}`, async (): Promise<{ doc?: T; error?: string }> => {
  const idx = (await getDoc<Idx>(col + "_idx", doc.ownerId)) ?? { ids: [] }; if (idx.ids.length >= max) return { error: `You've reached ${max} items. Delete some to make more.` };
  await Promise.all([putDoc(col, doc.id, doc), putDoc(col + "_idx", doc.ownerId, { ids: [doc.id, ...idx.ids] })]); return { doc };
});
export const saveOwned = <T extends Owned>(col: string, doc: T) => putDoc(col, doc.id, doc);
export const removeOwned = (col: string, ownerId: string, id: string) => locked(`${col}:${ownerId}`, async () => {
  const d = await getDoc<Owned>(col, id); if (!d || d.ownerId !== ownerId) return false; await delDoc(col, id);
  const idx = await getDoc<Idx>(col + "_idx", ownerId); if (idx) await putDoc(col + "_idx", ownerId, { ids: idx.ids.filter(x => x !== id) }); return true;
});
export async function adoptOwned(col: string, fromId: string, toId: string): Promise<number> {
  const idx = await getDoc<Idx>(col + "_idx", toId); if (!idx) return 0; let n = 0;
  await Promise.all(idx.ids.map(async id => { const d = await getDoc<Owned>(col, id); if (d && d.ownerId === fromId) { d.ownerId = toId; await putDoc(col, id, d); n++; } })); return n;
}

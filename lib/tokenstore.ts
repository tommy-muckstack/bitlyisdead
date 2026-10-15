// API access tokens (Settings → API): shown once, stored hashed. `Authorization: Bearer bid_…` on /api/* acts as the owner.
import crypto from "node:crypto";
import { addOwned, listOwned, removeOwned, saveOwned, newId, type Owned } from "@/lib/owned";
import { getDoc, putDoc, delDoc } from "@/lib/store";
export type TokenDoc = Owned & { name: string; prefix: string; hash: string; lastUsedAt: string | null };
export const COL = "tokens"; const hash = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
export const listTokens = (ownerId: string) => listOwned<TokenDoc>(COL, ownerId);
export async function createToken(ownerId: string, name: string): Promise<{ token?: string; doc?: TokenDoc; error?: string }> {
  const secret = "bid_" + crypto.randomBytes(24).toString("base64url"); const doc: TokenDoc = { id: newId(), ownerId, createdAt: new Date().toISOString(), name: name.trim().slice(0, 40) || "API token", prefix: secret.slice(0, 10) + "…", hash: hash(secret), lastUsedAt: null };
  const a = await addOwned(COL, doc, 10); if (!a.doc) return { error: a.error }; await putDoc("tokenhash", doc.hash, { ownerId, id: doc.id }); return { token: secret, doc };
}
export async function revokeToken(ownerId: string, id: string): Promise<boolean> { const t = (await listTokens(ownerId)).find(x => x.id === id); if (!t) return false; await delDoc("tokenhash", t.hash); return removeOwned(COL, ownerId, id); }
/** Owner id for a bearer token, or null. Updates lastUsedAt (best effort, at most once a minute). */
export async function ownerOfToken(bearer: string): Promise<string | null> {
  if (!/^bid_[A-Za-z0-9_-]{20,}$/.test(bearer)) return null; const ref = await getDoc<{ ownerId: string; id: string }>("tokenhash", hash(bearer)); if (!ref) return null;
  const doc = await getDoc<TokenDoc>(COL, ref.id); if (doc && doc.ownerId === ref.ownerId && (!doc.lastUsedAt || Date.now() - new Date(doc.lastUsedAt).getTime() > 60_000)) { doc.lastUsedAt = new Date().toISOString(); saveOwned(COL, doc).catch(() => {}); }
  return doc ? ref.ownerId : null;
}

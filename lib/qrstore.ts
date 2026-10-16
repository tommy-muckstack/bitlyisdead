// QR Codes: each one is backed by a short link (scans are counted on the link, apart from clicks) plus a stored design.
import { addOwned, getOwned, listOwned, removeOwned, saveOwned, newId, type Owned } from "@/lib/owned";
import { createLink, getLink, updateLink, type CreateInput } from "@/lib/linkstore";
import { cleanStyle, type QrStyle } from "@/lib/qr";
import type { Link } from "@/lib/links";
export type QrDoc = Owned & { code: string; title: string; style: QrStyle; hidden: boolean };
export const COL = "qrcodes";
export const listQr = (ownerId: string) => listOwned<QrDoc>(COL, ownerId);
export const getQr = (ownerId: string, id: string) => getOwned<QrDoc>(COL, ownerId, id);
/** Create a QR Code: for an existing link (`code`) or a new destination (creates the backing link, `linkInput`). */
export async function createQr(ownerId: string, input: { code?: string; linkInput?: CreateInput; title?: string; style?: unknown }, ownHosts: string[]): Promise<{ qr?: QrDoc; link?: Link; error?: string }> {
  let link: Link | null = null;
  if (input.code) { link = await getLink(input.code); if (!link || link.ownerId !== ownerId) return { error: "Link not found" }; if (link.qrId) return { error: "That link already has a QR Code." }; }
  else { const r = await createLink(ownerId, { ...(input.linkInput ?? { url: "" }), title: input.linkInput?.title || input.title }, ownHosts); if (!r.link) return { error: r.error }; link = r.link; }
  const qr: QrDoc = { id: newId(), ownerId, createdAt: new Date().toISOString(), code: link.code, title: (input.title ?? link.title ?? "").trim().slice(0, 100), style: cleanStyle(input.style), hidden: false };
  const a = await addOwned(COL, qr); if (!a.doc) return { error: a.error }; await updateLink(ownerId, link.code, { qrId: qr.id }, ownHosts); return { qr, link };
}
export async function updateQr(ownerId: string, id: string, patch: { title?: string; style?: unknown; hidden?: boolean }): Promise<QrDoc | null> {
  const q = await getQr(ownerId, id); if (!q) return null; if (patch.title !== undefined) q.title = String(patch.title).trim().slice(0, 100); if (patch.style !== undefined) q.style = cleanStyle(patch.style); if (patch.hidden !== undefined) q.hidden = !!patch.hidden; await saveOwned(COL, q); return q;
}
export async function deleteQr(ownerId: string, id: string, ownHosts: string[]): Promise<boolean> { const q = await getQr(ownerId, id); if (!q) return false; await updateLink(ownerId, q.code, { qrId: null }, ownHosts); return removeOwned(COL, ownerId, id); }
/** QR Codes joined with their backing links (scan counts live on the link). */
export async function listQrWithLinks(ownerId: string): Promise<(QrDoc & { link: Link | null })[]> { const qs = await listQr(ownerId); const ls = await Promise.all(qs.map(q => getLink(q.code))); return qs.map((q, i) => ({ ...q, link: ls[i] })); }

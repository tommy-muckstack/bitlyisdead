// Link-in-bio Pages: blocks + theme, published at /p/<slug>. Views and per-block clicks are counted in daily buckets.
import { addOwned, getOwned, listOwned, removeOwned, saveOwned, newId } from "@/lib/owned";
import { getDoc, putDoc, delDoc } from "@/lib/store";
import { dayKey, isBot } from "@/lib/links";
import { THEMES, type Block, type PageDoc } from "@/lib/pages-types";
export { THEMES }; export type { Block, PageDoc, Theme } from "@/lib/pages-types";
export const COL = "pages"; const LIM = { title: 60, bio: 160, blocks: 30, blockTitle: 80, url: 2048 };
const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/; const RESERVED = new Set(["app", "api", "new", "login", "pricing", "help"]);
export const listPages = (ownerId: string) => listOwned<PageDoc>(COL, ownerId);
export const getPage = (ownerId: string, id: string) => getOwned<PageDoc>(COL, ownerId, id);
export async function getPublicPage(slug: string): Promise<PageDoc | null> { const ref = await getDoc<{ id: string }>("pageslugs", slug); if (!ref) return null; const p = await getDoc<PageDoc>(COL, ref.id); return p && p.published ? p : null; }
export const cleanSlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
export async function createPage(ownerId: string, input: { title?: string; slug?: string }): Promise<{ page?: PageDoc; error?: string }> {
  let slug = cleanSlug(input.slug || input.title || "my-page"); if (!SLUG.test(slug) || RESERVED.has(slug)) slug = "page-" + newId(6).toLowerCase();
  if (await getDoc("pageslugs", slug)) slug = `${slug.slice(0, 30)}-${newId(4).toLowerCase()}`;
  const page: PageDoc = { id: newId(), ownerId, createdAt: new Date().toISOString(), slug, title: (input.title ?? "").trim().slice(0, LIM.title) || "My page", bio: "", emoji: "", theme: "light", blocks: [], published: false, views: 0, dailyViews: {} };
  const a = await addOwned(COL, page, 50); if (!a.doc) return { error: a.error }; await putDoc("pageslugs", slug, { id: page.id }); return { page };
}
export function cleanBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return []; const out: Block[] = [];
  for (const b of raw.slice(0, LIM.blocks)) { if (!b || typeof b !== "object") continue; const o = b as Record<string, unknown>; const type = ["link", "heading", "text"].includes(String(o.type)) ? (o.type as Block["type"]) : "link"; let url = String(o.url ?? "").trim().slice(0, LIM.url); if (type === "link" && url && !/^https?:\/\//i.test(url)) url = "https://" + url; if (type === "link" && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(url)) url = url ? url : ""; out.push({ id: typeof o.id === "string" && /^[A-Za-z0-9]{4,12}$/.test(o.id) ? o.id : newId(8), type, title: String(o.title ?? "").trim().slice(0, type === "text" ? 400 : LIM.blockTitle), url: type === "link" ? url : "", clicks: typeof o.clicks === "number" ? o.clicks : 0 }); }
  return out;
}
export async function updatePage(ownerId: string, id: string, patch: Partial<Pick<PageDoc, "title" | "bio" | "emoji" | "theme" | "published">> & { slug?: string; blocks?: unknown }): Promise<{ page?: PageDoc; error?: string }> {
  const p = await getPage(ownerId, id); if (!p) return { error: "Not found" };
  if (patch.slug !== undefined) { const s = cleanSlug(patch.slug); if (!SLUG.test(s) || RESERVED.has(s)) return { error: "Use 3–40 lowercase letters, numbers or dashes for the URL." }; if (s !== p.slug) { if (await getDoc("pageslugs", s)) return { error: "That page URL is taken." }; await delDoc("pageslugs", p.slug); await putDoc("pageslugs", s, { id: p.id }); p.slug = s; } }
  if (patch.title !== undefined) p.title = String(patch.title).trim().slice(0, LIM.title) || p.title; if (patch.bio !== undefined) p.bio = String(patch.bio).trim().slice(0, LIM.bio); if (patch.emoji !== undefined) p.emoji = String(patch.emoji).trim().slice(0, 4);
  if (patch.theme !== undefined && THEMES.includes(patch.theme)) p.theme = patch.theme; if (patch.published !== undefined) p.published = !!patch.published;
  if (patch.blocks !== undefined) { const old = new Map(p.blocks.map(b => [b.id, b.clicks])); p.blocks = cleanBlocks(patch.blocks).map(b => ({ ...b, clicks: old.get(b.id) ?? 0 })); }
  await saveOwned(COL, p); return { page: p };
}
export async function deletePage(ownerId: string, id: string): Promise<boolean> { const p = await getPage(ownerId, id); if (!p) return false; await delDoc("pageslugs", p.slug); return removeOwned(COL, ownerId, id); }
/** Count a page view (public route); bots are ignored. */
export async function viewPage(p: PageDoc, ua: string) { if (isBot(ua)) return; p.views++; const d = dayKey(); p.dailyViews[d] = (p.dailyViews[d] ?? 0) + 1; await saveOwned(COL, p); }
export async function clickBlock(p: PageDoc, blockId: string, ua: string): Promise<string | null> { const b = p.blocks.find(x => x.id === blockId && x.type === "link"); if (!b || !b.url) return null; if (!isBot(ua)) { b.clicks++; await saveOwned(COL, p); } return b.url; }

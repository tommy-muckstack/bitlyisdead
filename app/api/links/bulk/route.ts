import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deleteLink, updateLink, type Patch } from "@/lib/linkstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
/** Bulk actions from the Links page: { codes, patch } (hide/unhide/turn off/add tags) or { codes, delete: true }. Max 200 per call. */
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const b = await req.json().catch(() => null); const codes: string[] = Array.isArray(b?.codes) ? b.codes.filter((c: unknown) => typeof c === "string").slice(0, 200) : [];
  if (!codes.length) return NextResponse.json({ error: "No links selected." }, { status: 400 });
  if (b.delete === true) { const r = await Promise.all(codes.map(c => deleteLink(u.id, c))); return NextResponse.json({ deleted: codes.filter((_, i) => r[i]) }); }
  const p = b.patch ?? {}; const patch: Patch = { hidden: typeof p.hidden === "boolean" ? p.hidden : undefined, disabled: typeof p.disabled === "boolean" ? p.disabled : undefined, campaignId: p.campaignId === null ? null : typeof p.campaignId === "string" ? p.campaignId : undefined };
  const addTags: string[] = Array.isArray(p.addTags) ? p.addTags : []; const host = [originOf(req).host];
  const out = await Promise.all(codes.map(async c => { const cur = addTags.length ? (await import("@/lib/linkstore")).getLink(c) : null; const l = await cur; const r = await updateLink(u.id, c, { ...patch, ...(addTags.length && l ? { tags: [...l.tags, ...addTags] } : {}) }, host); return r.link ?? null; }));
  return NextResponse.json({ links: out.filter(Boolean) });
}

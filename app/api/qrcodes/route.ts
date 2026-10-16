import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createQr, listQrWithLinks } from "@/lib/qrstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ qrcodes: await listQrWithLinks(u.id) }); }
/** POST { code } (QR for an existing link) or { url, title, backHalf, tags } (new link) + { title, style }. */
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const b = await req.json().catch(() => null); if (!b || typeof b !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const title = typeof b.title === "string" ? b.title : "";
  const r = typeof b.code === "string" && b.code ? await createQr(u.id, { code: b.code, title, style: b.style }, [originOf(req).host])
    : typeof b.url === "string" ? await createQr(u.id, { linkInput: { url: b.url, title, backHalf: typeof b.backHalf === "string" ? b.backHalf : "", tags: Array.isArray(b.tags) ? b.tags : [] }, title, style: b.style }, [originOf(req).host])
    : { error: "A destination or an existing link is required." };
  return r.qr ? NextResponse.json({ qr: r.qr, link: r.link }, { status: 201 }) : NextResponse.json({ error: r.error }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { visit, getLink } from "@/lib/linkstore";
import { isLive } from "@/lib/links";
import { originOf } from "@/lib/origin";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const page = (status: number, h: string, p: string) => new NextResponse(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${h}</title><body style="font-family:system-ui;max-width:460px;margin:18vh auto;padding:0 20px;text-align:center"><h1 style="font-size:28px">${h}</h1><p style="color:#555">${p}</p><p><a href="${BP}/">Make your own short link</a></p></body>`, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
// 307 (never a cacheable 301) so every visit reaches us and gets counted. Only the stored, validated URL is ever redirected to.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const { host } = originOf(req);
  const l = await visit(code, { ua: req.headers.get("user-agent") ?? "", referer: req.headers.get("referer"), ownHost: host });
  if (!l) return page(404, "Link not found", "This short link doesn't exist, or it was deleted.");
  if (!isLive(l)) return page(410, l.disabled ? "This link is turned off" : "This link has expired", "The owner has stopped this short link.");
  return new NextResponse(null, { status: 307, headers: { location: l.url, "cache-control": "no-store", "referrer-policy": "no-referrer-when-downgrade" } });
}
export async function HEAD(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const l = await getLink((await params).code); return l && isLive(l) ? new NextResponse(null, { status: 307, headers: { location: l.url, "cache-control": "no-store" } }) : new NextResponse(null, { status: 404 });
}

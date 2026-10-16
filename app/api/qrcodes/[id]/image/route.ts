import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getQr } from "@/lib/qrstore";
import { renderQrSvg } from "@/lib/qr";
import { originOf } from "@/lib/origin";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
/** The styled QR Code as SVG (PNG/JPEG are rasterised in the browser from this same SVG). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser(); if (!u) return new NextResponse("Sign in first", { status: 401 }); const q = await getQr(u.id, (await params).id); if (!q) return new NextResponse("Not found", { status: 404 });
  const svg = renderQrSvg(`${originOf(req).origin}${BP}/s/${q.code}?r=qr`, q.style, { width: 1024 }); const dl: Record<string, string> = req.nextUrl.searchParams.get("download") ? { "content-disposition": `attachment; filename="${(q.title || q.code).replace(/[^\w-]+/g, "-")}-qr.svg"` } : {};
  return new NextResponse(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "private, no-store", ...dl } });
}

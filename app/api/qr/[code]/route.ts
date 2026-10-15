import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getLink } from "@/lib/linkstore";
import { originOf } from "@/lib/origin";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
// A QR code for the short link (public: it only encodes the public short URL).
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; if (!(await getLink(code))) return new NextResponse("Not found", { status: 404 });
  const target = `${originOf(req).origin}${BP}/s/${code}`; const fmt = req.nextUrl.searchParams.get("format") === "png" ? "png" : "svg"; const dl: Record<string, string> = req.nextUrl.searchParams.get("download") ? { "content-disposition": `attachment; filename="${code}-qr.${fmt}"` } : {};
  if (fmt === "png") return new NextResponse(new Uint8Array(await QRCode.toBuffer(target, { width: 640, margin: 2, errorCorrectionLevel: "M" })), { headers: { "content-type": "image/png", ...dl } });
  return new NextResponse(await QRCode.toString(target, { type: "svg", margin: 2, errorCorrectionLevel: "M" }), { headers: { "content-type": "image/svg+xml", ...dl } });
}

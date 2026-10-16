import { NextRequest, NextResponse } from "next/server";
import { clickBlock, getPublicPage } from "@/lib/pagestore";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
/** A link block on a published page: count the click, then redirect to its URL. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; block: string }> }) {
  const { slug, block } = await params; const p = await getPublicPage(slug); if (!p) return new NextResponse("Not found", { status: 404 });
  const url = await clickBlock(p, block, req.headers.get("user-agent") ?? ""); if (!url) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(null, { status: 307, headers: { location: url, "cache-control": "no-store" } });
}

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createLink, listLinks } from "@/lib/linkstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ links: await listLinks(u.id, u.demo) }); }
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const b = await req.json().catch(() => null); if (!b || typeof b.url !== "string") return NextResponse.json({ error: "A url is required." }, { status: 400 });
  if (u.demo) await listLinks(u.id, true); // seed the demo workspace once
  const r = await createLink(u.id, { url: b.url, title: typeof b.title === "string" ? b.title : "", backHalf: typeof b.backHalf === "string" ? b.backHalf : "", expiresAt: typeof b.expiresAt === "string" && b.expiresAt ? b.expiresAt : null, tags: Array.isArray(b.tags) ? b.tags : [], campaignId: typeof b.campaignId === "string" ? b.campaignId : null }, [originOf(req).host]);
  return r.link ? NextResponse.json({ link: r.link }, { status: 201 }) : NextResponse.json({ error: r.error }, { status: 400 });
}

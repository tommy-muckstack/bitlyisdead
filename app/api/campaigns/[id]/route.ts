import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deleteCampaign, getCampaign, updateCampaign } from "@/lib/campaignstore";
import { listLinks, updateLink } from "@/lib/linkstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const c = await getCampaign(u.id, (await params).id); return c ? NextResponse.json({ campaign: c }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
/** PATCH { name, description, utm } and/or { addLinks: [codes], removeLinks: [codes] }. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const { id } = await params; const b = await req.json().catch(() => ({})); const host = [originOf(req).host];
  const c = await updateCampaign(u.id, id, { name: b.name, description: b.description, utm: b.utm && typeof b.utm === "object" ? b.utm : undefined }); if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  for (const code of Array.isArray(b.addLinks) ? b.addLinks.slice(0, 200) : []) if (typeof code === "string") await updateLink(u.id, code, { campaignId: id }, host);
  for (const code of Array.isArray(b.removeLinks) ? b.removeLinks.slice(0, 200) : []) if (typeof code === "string") await updateLink(u.id, code, { campaignId: null }, host);
  return NextResponse.json({ campaign: c });
}
export async function DELETE(req: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const { id } = await params; const host = [originOf(req).host]; for (const l of (await listLinks(u.id, u.demo)).filter(l => l.campaignId === id)) await updateLink(u.id, l.code, { campaignId: null }, host); return (await deleteCampaign(u.id, id)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }

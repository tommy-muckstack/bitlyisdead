import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deleteLink, getLink, updateLink } from "@/lib/linkstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ code: string }> };
export async function GET(_r: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const l = await getLink((await params).code); return l && l.ownerId === u.id ? NextResponse.json({ link: l }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => null); if (!b || typeof b !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const r = await updateLink(u.id, (await params).code, { url: typeof b.url === "string" ? b.url : undefined, title: typeof b.title === "string" ? b.title : undefined, disabled: typeof b.disabled === "boolean" ? b.disabled : undefined, expiresAt: b.expiresAt === null ? null : typeof b.expiresAt === "string" ? b.expiresAt : undefined }, [originOf(req).host]);
  return r.link ? NextResponse.json({ link: r.link }) : NextResponse.json({ error: r.error }, { status: r.error === "Not found" ? 404 : 400 });
}
export async function DELETE(_r: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return (await deleteLink(u.id, (await params).code)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }

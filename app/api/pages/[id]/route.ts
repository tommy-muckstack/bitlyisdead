import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deletePage, getPage, updatePage } from "@/lib/pagestore";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const p = await getPage(u.id, (await params).id); return p ? NextResponse.json({ page: p }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function PATCH(req: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const r = await updatePage(u.id, (await params).id, { title: b.title, bio: b.bio, emoji: b.emoji, theme: b.theme, published: b.published, slug: b.slug, blocks: b.blocks }); return r.page ? NextResponse.json({ page: r.page }) : NextResponse.json({ error: r.error }, { status: r.error === "Not found" ? 404 : 400 }); }
export async function DELETE(_r: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return (await deletePage(u.id, (await params).id)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }

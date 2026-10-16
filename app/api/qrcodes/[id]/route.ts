import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deleteQr, getQr, updateQr } from "@/lib/qrstore";
import { getLink } from "@/lib/linkstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_r: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const q = await getQr(u.id, (await params).id); return q ? NextResponse.json({ qr: q, link: await getLink(q.code) }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function PATCH(req: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const q = await updateQr(u.id, (await params).id, { title: typeof b.title === "string" ? b.title : undefined, style: b.style, hidden: typeof b.hidden === "boolean" ? b.hidden : undefined }); return q ? NextResponse.json({ qr: q }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function DELETE(req: NextRequest, { params }: Ctx) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return (await deleteQr(u.id, (await params).id, [originOf(req).host])) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }

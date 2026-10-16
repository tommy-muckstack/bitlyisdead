import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createPage, listPages } from "@/lib/pagestore";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ pages: await listPages(u.id) }); }
export async function POST(req: NextRequest) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const r = await createPage(u.id, { title: typeof b.title === "string" ? b.title : "", slug: typeof b.slug === "string" ? b.slug : "" }); return r.page ? NextResponse.json({ page: r.page }, { status: 201 }) : NextResponse.json({ error: r.error }, { status: 400 }); }

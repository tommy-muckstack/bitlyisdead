import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { addDomain, listDomains } from "@/lib/domainstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ domains: await listDomains(u.id) }); }
export async function POST(req: NextRequest) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const r = await addDomain(u.id, String(b.host ?? ""), originOf(req).host); return r.domain ? NextResponse.json({ domain: r.domain }, { status: 201 }) : NextResponse.json({ error: r.error }, { status: 400 }); }

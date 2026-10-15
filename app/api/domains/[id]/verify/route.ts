import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { verifyDomain } from "@/lib/domainstore";
import { originOf } from "@/lib/origin";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const d = await verifyDomain(u.id, (await params).id, originOf(req).host); return d ? NextResponse.json({ domain: d }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }

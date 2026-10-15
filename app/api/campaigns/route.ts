import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createCampaign, listCampaigns } from "@/lib/campaignstore";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ campaigns: await listCampaigns(u.id) }); }
export async function POST(req: NextRequest) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); const r = await createCampaign(u.id, { name: b.name, description: b.description, utm: b.utm && typeof b.utm === "object" ? b.utm : {} }); return r.campaign ? NextResponse.json({ campaign: r.campaign }, { status: 201 }) : NextResponse.json({ error: r.error }, { status: 400 }); }

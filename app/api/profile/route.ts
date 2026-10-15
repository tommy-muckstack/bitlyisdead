import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getProfile, saveProfile } from "@/lib/profile";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ profile: await getProfile(u.id) }); }
export async function PATCH(req: NextRequest) { const u = await currentUser(); if (!u || u.api) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); const b = await req.json().catch(() => ({})); return NextResponse.json({ profile: await saveProfile(u.id, { name: typeof b.name === "string" ? b.name : undefined, useCase: typeof b.useCase === "string" ? b.useCase : undefined, onboardedAt: b.onboarded === true ? new Date().toISOString() : undefined }) }); }

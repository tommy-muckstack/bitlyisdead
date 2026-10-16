import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { search } from "@/lib/search";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100); if (!q) return NextResponse.json({ hits: [] });
  return NextResponse.json({ hits: await search(u.id, q, u.demo) });
}

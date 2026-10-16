import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { deleteDomain } from "@/lib/domainstore";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) { const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return (await deleteDomain(u.id, (await params).id)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }

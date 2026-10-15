import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createToken, listTokens } from "@/lib/tokenstore";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { const u = await currentUser(); if (!u || u.api) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); return NextResponse.json({ tokens: (await listTokens(u.id)).map(({ hash: _h, ...t }) => t) }); }
/** Tokens can only be minted from a browser session (never from another token) and never for guests or the demo account. */
export async function POST(req: NextRequest) { const u = await currentUser(); if (!u || u.api) return NextResponse.json({ error: "Sign in first" }, { status: 401 }); if (u.guest || u.demo) return NextResponse.json({ error: "Sign in with an account to create API tokens." }, { status: 403 }); const b = await req.json().catch(() => ({})); const r = await createToken(u.id, String(b.name ?? "")); return r.token ? NextResponse.json({ token: r.token, doc: { ...r.doc, hash: undefined } }, { status: 201 }) : NextResponse.json({ error: r.error }, { status: 400 }); }

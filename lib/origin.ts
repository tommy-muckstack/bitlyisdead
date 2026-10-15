import type { NextRequest } from "next/server";
/** Public origin of this deployment (honours the proxy headers Vercel sets). */
export function originOf(req: NextRequest | Request): { origin: string; host: string } {
  const h = req.headers; const host = h.get("x-forwarded-host") ?? h.get("host") ?? new URL(req.url).host; const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return { origin: `${proto}://${host}`, host: host.split(":")[0]! };
}

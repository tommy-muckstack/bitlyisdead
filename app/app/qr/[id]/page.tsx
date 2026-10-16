import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { getQr } from "@/lib/qrstore";
import { getLink } from "@/lib/linkstore";
import { QrDetail } from "@/components/QrDetail";
export const dynamic = "force-dynamic";
export default async function Qr({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(); const q = await getQr(u.id, (await params).id); if (!q) notFound(); const l = await getLink(q.code); if (!l) notFound();
  return <Suspense><QrDetail initial={q} link={l} /></Suspense>;
}

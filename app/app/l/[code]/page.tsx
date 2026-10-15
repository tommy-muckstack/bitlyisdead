import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getLink } from "@/lib/linkstore";
import { Suspense } from "react";
import Link from "next/link";
import { LinkDetails } from "@/components/LinkDetails";
export const dynamic = "force-dynamic";
export default async function Details({ params }: { params: Promise<{ code: string }> }) {
  const u = await requireUser(); const l = await getLink((await params).code); if (!l || l.ownerId !== u.id) notFound(); return <Suspense><LinkDetails initial={l} extra={l.qrId ? <Link className="iconbtn" href={`/app/qr/${l.qrId}`}>Customize QR Code</Link> : <Link className="iconbtn" href={`/app/qr/new?link=${l.code}`}>Create a styled QR Code</Link>} /></Suspense>;
}

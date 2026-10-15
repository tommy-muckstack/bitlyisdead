import { notFound } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getLink } from "@/lib/linkstore";
import { LinkDetails } from "@/components/LinkDetails";
export const dynamic = "force-dynamic";
export default async function Details({ params }: { params: Promise<{ code: string }> }) {
  const u = (await currentUser())!; const l = await getLink((await params).code); if (!l || l.ownerId !== u.id) notFound(); return <LinkDetails initial={l} />;
}

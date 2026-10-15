import { requireUser } from "@/lib/session";
import { getLink } from "@/lib/linkstore";
import { QrNew } from "@/components/QrNew";
export const dynamic = "force-dynamic"; export const metadata = { title: "Create a QR Code" };
export default async function NewQr({ searchParams }: { searchParams: Promise<{ link?: string; url?: string }> }) {
  const u = await requireUser(); const { link, url } = await searchParams; const l = link ? await getLink(link) : null;
  return <QrNew link={l && l.ownerId === u.id && !l.qrId ? l : null} prefill={url} />;
}

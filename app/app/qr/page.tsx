import { requireUser } from "@/lib/session";
import { listQrWithLinks } from "@/lib/qrstore";
import { QrList } from "@/components/QrList";
export const dynamic = "force-dynamic"; export const metadata = { title: "QR Codes" };
export default async function QrCodes() { const u = await requireUser(); return <QrList initial={await listQrWithLinks(u.id)} />; }

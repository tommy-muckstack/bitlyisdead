import { requireUser } from "@/lib/session";
import { listLinks } from "@/lib/linkstore";
import { LinksApp } from "@/components/LinksApp";
export const dynamic = "force-dynamic";
export const metadata = { title: "Links" };
export default async function Links({ searchParams }: { searchParams: Promise<{ q?: string; url?: string }> }) {
  const u = await requireUser(); const { q, url } = await searchParams; return <LinksApp initial={await listLinks(u.id, u.demo)} prefill={url} query={q} />;
}

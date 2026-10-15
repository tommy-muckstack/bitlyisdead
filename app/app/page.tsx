import { currentUser } from "@/lib/session";
import { listLinks } from "@/lib/linkstore";
import { LinksApp } from "@/components/LinksApp";
export const dynamic = "force-dynamic";
export default async function AppHome({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const u = (await currentUser())!; const { url } = await searchParams; return <LinksApp initial={await listLinks(u.id, u.demo)} prefill={url} />;
}

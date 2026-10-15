import { requireUser } from "@/lib/session";
import { listLinks } from "@/lib/linkstore";
import { HomeDash } from "@/components/HomeDash";
export const dynamic = "force-dynamic";
export default async function AppHome({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const u = await requireUser(); const { url } = await searchParams; return <HomeDash links={await listLinks(u.id, u.demo)} prefill={url} name={u.name} />;
}

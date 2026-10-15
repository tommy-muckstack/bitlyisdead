import { requireUser } from "@/lib/session";
import { listLinks } from "@/lib/linkstore";
import { listPages } from "@/lib/pagestore";
import { HomeDash } from "@/components/HomeDash";
export const dynamic = "force-dynamic";
export default async function AppHome({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const u = await requireUser(); const { url } = await searchParams; const [links, pages] = await Promise.all([listLinks(u.id, u.demo), listPages(u.id)]); return <HomeDash links={links} prefill={url} name={u.name} hasPage={pages.length > 0} />;
}

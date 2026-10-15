import { requireUser } from "@/lib/session";
import { getCampaign } from "@/lib/campaignstore";
import { listLinks } from "@/lib/linkstore";
import { CreateLink } from "@/components/CreateLink";
export const dynamic = "force-dynamic";
export const metadata = { title: "Create a link" };
export default async function NewLink({ searchParams }: { searchParams: Promise<{ url?: string; campaign?: string }> }) {
  const u = await requireUser(); const { url, campaign } = await searchParams; const [c, ls] = await Promise.all([campaign ? getCampaign(u.id, campaign) : null, listLinks(u.id, u.demo)]);
  return <CreateLink prefill={url} campaign={c ? { id: c.id, name: c.name, utm: c.utm } : null} suggestions={Array.from(new Set(ls.flatMap(l => l.tags))).sort()} />;
}

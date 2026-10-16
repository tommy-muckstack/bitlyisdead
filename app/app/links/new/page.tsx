import { requireUser } from "@/lib/session";
import { getCampaign } from "@/lib/campaignstore";
import { listLinks } from "@/lib/linkstore";
import { listDomains } from "@/lib/domainstore";
import { CreateLink } from "@/components/CreateLink";
export const dynamic = "force-dynamic";
export const metadata = { title: "Create a link" };
export default async function NewLink({ searchParams }: { searchParams: Promise<{ url?: string; campaign?: string }> }) {
  const u = await requireUser(); const { url, campaign } = await searchParams; const [c, ls, ds] = await Promise.all([campaign ? getCampaign(u.id, campaign) : null, listLinks(u.id, u.demo), listDomains(u.id)]);
  return <CreateLink prefill={url} campaign={c ? { id: c.id, name: c.name, utm: c.utm } : null} suggestions={Array.from(new Set(ls.flatMap(l => l.tags))).sort()} domains={ds.filter(d => d.status === "verified").map(d => d.host)} />;
}

import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getCampaign } from "@/lib/campaignstore";
import { listLinks } from "@/lib/linkstore";
import { aggregate } from "@/lib/analytics";
import { CampaignDetail } from "@/components/Campaigns";
export const dynamic = "force-dynamic";
export default async function Campaign({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(); const { id } = await params; const [c, ls] = await Promise.all([getCampaign(u.id, id), listLinks(u.id, u.demo)]); if (!c) notFound();
  const mine = ls.filter(l => l.campaignId === id); return <CampaignDetail campaign={c} links={mine} others={ls.filter(l => !l.campaignId && !l.hidden)} agg={aggregate(mine, 30)} />;
}

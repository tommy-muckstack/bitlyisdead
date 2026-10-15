import { requireUser } from "@/lib/session";
import { listCampaigns } from "@/lib/campaignstore";
import { listLinks } from "@/lib/linkstore";
import { CampaignsList } from "@/components/Campaigns";
export const dynamic = "force-dynamic"; export const metadata = { title: "Campaigns" };
export default async function Campaigns() { const u = await requireUser(); const [cs, ls] = await Promise.all([listCampaigns(u.id), listLinks(u.id, u.demo)]); return <CampaignsList initial={cs} links={ls} />; }

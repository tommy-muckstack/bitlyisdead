import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getCampaign } from "@/lib/campaignstore";
import { CampaignForm } from "@/components/Campaigns";
export const dynamic = "force-dynamic"; export const metadata = { title: "Edit campaign" };
export default async function EditCampaign({ params }: { params: Promise<{ id: string }> }) { const u = await requireUser(); const c = await getCampaign(u.id, (await params).id); if (!c) notFound(); return <CampaignForm initial={c} />; }

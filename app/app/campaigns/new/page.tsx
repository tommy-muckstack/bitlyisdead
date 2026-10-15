import { requireUser } from "@/lib/session";
import { CampaignForm } from "@/components/Campaigns";
export const dynamic = "force-dynamic"; export const metadata = { title: "Create a campaign" };
export default async function NewCampaign() { await requireUser(); return <CampaignForm />; }

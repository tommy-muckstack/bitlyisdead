import { requireUser } from "@/lib/session";
import { BillingSettings } from "@/components/Settings";
export const dynamic = "force-dynamic"; export const metadata = { title: "Billing" };
export default async function BillingPage() { await requireUser(); return <BillingSettings />; }

import { requireUser } from "@/lib/session";
import { Upgrade } from "@/components/Upgrade";
export const dynamic = "force-dynamic"; export const metadata = { title: "Upgrade" };
export default async function UpgradePage() { await requireUser(); return <Upgrade />; }

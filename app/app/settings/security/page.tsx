import { requireUser } from "@/lib/session";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
import { SecuritySettings } from "@/components/Settings";
export const dynamic = "force-dynamic"; export const metadata = { title: "Security" };
export default async function SecurityPage() { const u = await requireUser(); return <SecuritySettings user={u} config={firebaseConfigured() ? firebaseClientConfig() : null} />; }

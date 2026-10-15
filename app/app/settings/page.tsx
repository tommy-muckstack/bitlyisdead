import { requireUser } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { ProfileSettings } from "@/components/Settings";
export const dynamic = "force-dynamic"; export const metadata = { title: "Settings" };
export default async function SettingsPage() { const u = await requireUser(); return <ProfileSettings user={u} profile={await getProfile(u.id)} />; }

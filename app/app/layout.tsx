import { redirect } from "next/navigation";
import { currentUser, entryRedirect, requestedAppPath } from "@/lib/session";
import { AppShell } from "@/components/AppShell";
import { shellCfg } from "@/components/shellCfg";
import { getProfile } from "@/lib/profile";
export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect(entryRedirect(await requestedAppPath("/app")));
  const prof = user.guest ? null : await getProfile(user.id); if (prof?.name) user.name = prof.name;
  return <AppShell user={user} cfg={shellCfg}>{children}</AppShell>;
}

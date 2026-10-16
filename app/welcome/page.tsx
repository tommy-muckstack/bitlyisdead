import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { BP } from "@/lib/basepath";
import { Welcome } from "@/components/Welcome";
export const dynamic = "force-dynamic"; export const metadata = { title: "Welcome" };
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const u = await currentUser(); const { next } = await searchParams; const to = next && /^\/(?!\/)/.test(next) ? next : BP + "/app";
  if (!u || u.guest || u.demo) redirect(to); if ((await getProfile(u.id)).onboardedAt) redirect(to);
  return <Welcome next={to} />;
}

import { requireUser } from "@/lib/session";
import { listLinks } from "@/lib/linkstore";
import { listPages } from "@/lib/pagestore";
import { getProfile } from "@/lib/profile";
import { HomeDash } from "@/components/HomeDash";
export const dynamic = "force-dynamic";
export default async function AppHome({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const u = await requireUser(); const { url } = await searchParams; const [links, pages, prof] = await Promise.all([listLinks(u.id, u.demo), listPages(u.id), u.guest ? null : getProfile(u.id)]); return <HomeDash links={links} prefill={url} name={u.name} hasPage={pages.length > 0} useCase={prof?.useCase ?? ""} />;
}

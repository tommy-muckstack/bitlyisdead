import { requireUser } from "@/lib/session";
import { listPages } from "@/lib/pagestore";
import { PagesList } from "@/components/PagesList";
export const dynamic = "force-dynamic"; export const metadata = { title: "Pages" };
export default async function Pages() { const u = await requireUser(); return <PagesList initial={await listPages(u.id)} />; }

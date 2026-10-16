import { requireUser } from "@/lib/session";
import { listDomains } from "@/lib/domainstore";
import { Domains } from "@/components/Domains";
export const dynamic = "force-dynamic"; export const metadata = { title: "Custom domains" };
export default async function DomainsPage() { const u = await requireUser(); return <Domains initial={await listDomains(u.id)} />; }

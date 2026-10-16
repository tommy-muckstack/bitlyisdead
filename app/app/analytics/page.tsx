import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { listLinks } from "@/lib/linkstore";
import { aggregate } from "@/lib/analytics";
import { Analytics } from "@/components/Analytics";
export const dynamic = "force-dynamic"; export const metadata = { title: "Analytics" };
export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string; from?: string; to?: string }> }) {
  const u = await requireUser(); const { days, from, to } = await searchParams; const links = (await listLinks(u.id, u.demo)).filter(l => !l.hidden);
  let n = [7, 30, 90].includes(Number(days)) ? Number(days) : 30; let end = new Date();
  const ok = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
  if (ok(from) || ok(to)) { const f = ok(from) ? new Date(from!) : new Date(Date.now() - 29 * 864e5); const t = ok(to) ? new Date(to!) : new Date(); end = t; n = Math.min(366, Math.max(1, Math.round((t.getTime() - f.getTime()) / 864e5) + 1)); }
  return <Suspense><Analytics agg={aggregate(links, n, end)} days={n} linkCount={links.length} from={ok(from) ? from : undefined} to={ok(to) ? to : undefined} /></Suspense>;
}

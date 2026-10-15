import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPublicPage, viewPage } from "@/lib/pagestore";
import { PublicPage } from "@/components/PublicPage";
import "@/app/page-public.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const p = await getPublicPage((await params).slug); return { title: p ? `${p.title} · BitlyIsDead Pages` : "Page not found", description: p?.bio || undefined, robots: p ? undefined : { index: false } }; }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPublicPage((await params).slug); if (!p) notFound(); await viewPage(p, (await headers()).get("user-agent") ?? "");
  return <PublicPage page={p} />;
}

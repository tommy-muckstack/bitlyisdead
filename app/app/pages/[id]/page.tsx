import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getPage } from "@/lib/pagestore";
import { PageEditor } from "@/components/PageEditor";
export const dynamic = "force-dynamic"; export const metadata = { title: "Edit page" };
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) { const u = await requireUser(); const p = await getPage(u.id, (await params).id); if (!p) notFound(); return <PageEditor initial={p} />; }

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { createPage } from "@/lib/pagestore";
export const dynamic = "force-dynamic";
/** "Create new → Page": make a draft and open the editor. */
export default async function NewPage() { const u = await requireUser(); const r = await createPage(u.id, { title: "My page" }); redirect(r.page ? `/app/pages/${r.page.id}` : "/app/pages"); }

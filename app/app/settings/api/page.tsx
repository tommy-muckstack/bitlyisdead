import { requireUser } from "@/lib/session";
import { listTokens } from "@/lib/tokenstore";
import { ApiSettings } from "@/components/Settings";
export const dynamic = "force-dynamic"; export const metadata = { title: "API access" };
export default async function ApiPage() { const u = await requireUser(); return <ApiSettings user={u} initial={(await listTokens(u.id)).map(({ hash: _h, ownerId: _o, ...t }) => t)} />; }

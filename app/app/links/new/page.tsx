import { CreateLink } from "@/components/CreateLink";
export const dynamic = "force-dynamic";
export const metadata = { title: "Create a link" };
export default async function NewLink({ searchParams }: { searchParams: Promise<{ url?: string }> }) { const { url } = await searchParams; return <CreateLink prefill={url} />; }

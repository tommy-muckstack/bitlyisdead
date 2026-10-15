// Custom domains: add a hostname, prove you own it with a DNS TXT record, and see whether its CNAME points at this deployment.
// Verification is real (DNS lookups); serving short links on the custom host is only possible on a self-hosted deployment, and the UI says so.
import dns from "node:dns/promises";
import { addOwned, getOwned, listOwned, removeOwned, saveOwned, newId, type Owned } from "@/lib/owned";
export type DomainDoc = Owned & { host: string; token: string; status: "pending" | "verified"; verifiedAt: string | null; cname: "unknown" | "ok" | "missing"; lastCheckAt: string | null; lastError: string | null };
export const COL = "domains"; export const TXT_NAME = "_bitlyisdead"; export const txtValue = (d: DomainDoc) => `bitlyisdead-verify=${d.token}`;
const HOST = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
export const cleanHost = (s: string) => s.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
export const listDomains = (ownerId: string) => listOwned<DomainDoc>(COL, ownerId);
export const getDomain = (ownerId: string, id: string) => getOwned<DomainDoc>(COL, ownerId, id);
export async function addDomain(ownerId: string, raw: string, ownHost: string): Promise<{ domain?: DomainDoc; error?: string }> {
  const host = cleanHost(raw); if (!HOST.test(host)) return { error: "Enter a domain you own, like go.example.com." }; if (host === ownHost || host.endsWith(".vercel.app") || host.endsWith("yourappisdead.com")) return { error: "That domain is already ours." };
  if ((await listDomains(ownerId)).some(d => d.host === host)) return { error: "You already added that domain." };
  const d: DomainDoc = { id: newId(), ownerId, createdAt: new Date().toISOString(), host, token: newId(24), status: "pending", verifiedAt: null, cname: "unknown", lastCheckAt: null, lastError: null };
  const a = await addOwned(COL, d, 20); return a.doc ? { domain: d } : { error: a.error };
}
/** Look up the TXT ownership record and the CNAME; update the doc with what we found. */
export async function verifyDomain(ownerId: string, id: string, ownHost: string): Promise<DomainDoc | null> {
  const d = await getDomain(ownerId, id); if (!d) return null; d.lastCheckAt = new Date().toISOString(); d.lastError = null;
  try { const txt = (await dns.resolveTxt(`${TXT_NAME}.${d.host}`)).map(r => r.join("")); if (txt.includes(txtValue(d))) { if (d.status !== "verified") d.verifiedAt = new Date().toISOString(); d.status = "verified"; } else d.lastError = `Found ${txt.length} TXT record(s) at ${TXT_NAME}.${d.host}, none with your token yet.`; }
  catch (e) { d.lastError = `No TXT record at ${TXT_NAME}.${d.host} yet (${(e as { code?: string }).code ?? "lookup failed"}). DNS changes can take up to an hour.`; }
  try { const c = await dns.resolveCname(d.host); d.cname = c.some(x => x.replace(/\.$/, "") === ownHost) ? "ok" : "missing"; } catch { d.cname = "missing"; }
  await saveOwned(COL, d); return d;
}
export const deleteDomain = (ownerId: string, id: string) => removeOwned(COL, ownerId, id);

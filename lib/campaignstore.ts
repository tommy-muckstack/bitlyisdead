// Campaigns: a named group of links with default UTM parameters and rolled-up analytics.
import { addOwned, getOwned, listOwned, removeOwned, saveOwned, newId, type Owned } from "@/lib/owned";
export type CampaignDoc = Owned & { name: string; description: string; utm: { source: string; medium: string; campaign: string } };
export const COL = "campaigns";
export const listCampaigns = (ownerId: string) => listOwned<CampaignDoc>(COL, ownerId);
export const getCampaign = (ownerId: string, id: string) => getOwned<CampaignDoc>(COL, ownerId, id);
const str = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
export async function createCampaign(ownerId: string, input: { name?: string; description?: string; utm?: Record<string, unknown> }): Promise<{ campaign?: CampaignDoc; error?: string }> {
  const name = str(input.name, 60); if (!name) return { error: "Give the campaign a name." };
  const c: CampaignDoc = { id: newId(), ownerId, createdAt: new Date().toISOString(), name, description: str(input.description, 240), utm: { source: str(input.utm?.source, 60), medium: str(input.utm?.medium, 60), campaign: str(input.utm?.campaign, 60) } };
  const a = await addOwned(COL, c, 100); return a.doc ? { campaign: c } : { error: a.error };
}
export async function updateCampaign(ownerId: string, id: string, patch: { name?: string; description?: string; utm?: Record<string, unknown> }): Promise<CampaignDoc | null> {
  const c = await getCampaign(ownerId, id); if (!c) return null; if (patch.name !== undefined) c.name = str(patch.name, 60) || c.name; if (patch.description !== undefined) c.description = str(patch.description, 240);
  if (patch.utm) c.utm = { source: str(patch.utm.source, 60), medium: str(patch.utm.medium, 60), campaign: str(patch.utm.campaign, 60) }; await saveOwned(COL, c); return c;
}
export const deleteCampaign = (ownerId: string, id: string) => removeOwned(COL, ownerId, id);

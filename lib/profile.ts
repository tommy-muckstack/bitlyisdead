// Per-account profile doc (display name chosen in Settings; onboarding answers). Keyed by the user id so guest docs are adopted on sign-in.
import { getDoc, putDoc } from "@/lib/store";
export type Profile = { name: string; useCase: string; onboardedAt: string | null };
export const getProfile = async (id: string): Promise<Profile> => ({ name: "", useCase: "", onboardedAt: null, ...((await getDoc<Partial<Profile>>("profiles", id)) ?? {}) });
export async function saveProfile(id: string, patch: Partial<Profile>): Promise<Profile> { const p = { ...(await getProfile(id)), ...patch }; p.name = String(p.name ?? "").trim().slice(0, 60); p.useCase = String(p.useCase ?? "").trim().slice(0, 40); await putDoc("profiles", id, p); return p; }

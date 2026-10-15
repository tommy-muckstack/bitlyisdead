// Plain types/constants for link-in-bio pages (safe to import from client components; the store lives in lib/pagestore.ts).
export type Block = { id: string; type: "link" | "heading" | "text"; title: string; url: string; clicks: number };
export type Theme = "light" | "dark" | "sunset" | "ocean" | "mint";
export type PageDoc = { id: string; ownerId: string; createdAt: string; slug: string; title: string; bio: string; emoji: string; theme: Theme; blocks: Block[]; published: boolean; views: number; dailyViews: Record<string, number> };
export const THEMES: Theme[] = ["light", "dark", "sunset", "ocean", "mint"];

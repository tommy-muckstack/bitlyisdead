import type { ShellCfg } from "@/components/AppShell";
export const shellCfg: ShellCfg = { mode: "side", vars: { "--side-w": "248px", "--accent": "#1b5cf5", "--on-bg": "#eaf0ff", "--on-ink": "#1b5cf5", "--page": "#f4f5f7", "--top-bg": "#fff", "--r": "6px", "--top-h": "64px", "--side-ink": "#031f39", "--top-ink": "#031f39" } as Record<string, string>,
  create: [{ label: "Link", href: "/app/links/new", icon: "link" }],
  items: [{ label: "Home", href: "/app", icon: "home" }, { label: "Links", href: "/app/links", icon: "link", also: ["/app/l/"] }],
  foot: [], search: "Search links, QR Codes and Pages", right: [] };

import type { ShellCfg } from "@/components/AppShell";
export const shellCfg: ShellCfg = { mode: "side", vars: { "--side-w": "248px", "--accent": "#1b5cf5", "--on-bg": "#eaf0ff", "--on-ink": "#1b5cf5", "--page": "#f4f5f7", "--top-bg": "#fff", "--r": "6px", "--top-h": "64px", "--side-ink": "#031f39", "--top-ink": "#031f39" } as Record<string, string>,
  cta: { label: "Create new", href: "/app", icon: "plus" },
  items: [{ label: "Home", href: "/app", icon: "home" }, { label: "Links", href: "/app#links", icon: "link" }, { label: "QR Codes", href: "/app#qr", icon: "qr" }, { label: "Pages", href: "/app#pages", icon: "doc" }, { label: "Analytics", href: "/app#analytics", icon: "chart" }, { label: "Campaigns", href: "/app#campaigns", icon: "folder" }, { label: "Custom domains", href: "/app#domains", icon: "grid" }],
  foot: [{ label: "Settings", href: "/app#settings", icon: "settings" }], search: "Search links, QR Codes and Pages", right: [{ label: "Upgrade", href: "/app#upgrade" }] };

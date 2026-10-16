// The public link-in-bio page (also the live preview inside the editor). Original design; no Bitly assets.
import { BP } from "@/lib/basepath";
import type { PageDoc } from "@/lib/pages-types";
export const THEME_VARS: Record<PageDoc["theme"], React.CSSProperties> = {
  light: { "--pg-bg": "#F6F4EF", "--pg-ink": "#031F39", "--pg-card": "#FFFFFF", "--pg-bd": "#E3DED4" } as React.CSSProperties,
  dark: { "--pg-bg": "#0F172A", "--pg-ink": "#F8FAFC", "--pg-card": "#1E293B", "--pg-bd": "#334155" } as React.CSSProperties,
  sunset: { "--pg-bg": "linear-gradient(160deg,#F36600,#C2185B)", "--pg-ink": "#FFFFFF", "--pg-card": "rgba(255,255,255,.16)", "--pg-bd": "rgba(255,255,255,.35)" } as React.CSSProperties,
  ocean: { "--pg-bg": "linear-gradient(160deg,#031F39,#1B5CF5)", "--pg-ink": "#FFFFFF", "--pg-card": "rgba(255,255,255,.14)", "--pg-bd": "rgba(255,255,255,.3)" } as React.CSSProperties,
  mint: { "--pg-bg": "#E8F5EC", "--pg-ink": "#143D24", "--pg-card": "#FFFFFF", "--pg-bd": "#BFE0C8" } as React.CSSProperties,
};
export function PublicPage({ page, preview = false }: { page: PageDoc; preview?: boolean }) {
  const href = (b: PageDoc["blocks"][number]) => preview ? b.url : `${BP}/p/${page.slug}/${b.id}`;
  return <div className={"pg" + (preview ? " pg--preview" : "")} style={THEME_VARS[page.theme]}>
    <div className="pg-in">
      <div className="pg-av" aria-hidden>{page.emoji || page.title.trim()[0]?.toUpperCase() || "✦"}</div>
      <h1 className="pg-t">{page.title}</h1>{page.bio && <p className="pg-bio">{page.bio}</p>}
      <div className="pg-blocks">{page.blocks.map(b => b.type === "link" ? <a key={b.id} className="pg-link" href={href(b)} target={preview ? "_blank" : undefined} rel="noreferrer">{b.title || b.url}</a> : b.type === "heading" ? <h2 key={b.id} className="pg-h">{b.title}</h2> : <p key={b.id} className="pg-p">{b.title}</p>)}
        {page.blocks.length === 0 && <p className="pg-p" style={{ opacity: .7 }}>Nothing here yet.</p>}</div>
      <p className="pg-foot"><a href={`${BP}/`}>Made with BitlyIsDead</a></p>
    </div></div>;
}

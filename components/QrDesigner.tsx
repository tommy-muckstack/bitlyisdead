"use client";
// Step 2 of the QR flow and the edit panel on a QR Code's page: presets, pattern, corners, colours, frame + label, logo upload, live preview.
import { useMemo, useState } from "react";
import { DEFAULT_STYLE, PRESETS, renderQrSvg, type QrStyle } from "@/lib/qr";
export function QrPreview({ data, style, size = 240, testId }: { data: string; style: QrStyle; size?: number; testId?: string }) {
  const svg = useMemo(() => renderQrSvg(data || "https://example.com", style, { width: size }), [data, style, size]);
  return <div className="qr-prev" data-testid={testId} dangerouslySetInnerHTML={{ __html: svg }} />;
}
/** Rasterise the SVG in the browser (PNG/JPEG) or save it as-is (SVG). */
export async function downloadQr(data: string, style: QrStyle, fmt: "png" | "svg" | "jpeg", name: string) {
  const svg = renderQrSvg(data, style, { width: 1024 }); const file = `${name.replace(/[^\w-]+/g, "-") || "qr-code"}-qr.${fmt === "jpeg" ? "jpg" : fmt}`;
  const save = (url: string) => { const a = document.createElement("a"); a.href = url; a.download = file; document.body.appendChild(a); a.click(); a.remove(); };
  if (fmt === "svg") { const u = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); save(u); setTimeout(() => URL.revokeObjectURL(u), 2000); return; }
  const img = new Image(); const u = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("render")); img.src = u; });
  const c = document.createElement("canvas"); c.width = img.naturalWidth || 1024; c.height = img.naturalHeight || 1024; const g = c.getContext("2d")!; if (fmt === "jpeg") { g.fillStyle = style.bg; g.fillRect(0, 0, c.width, c.height); } g.drawImage(img, 0, 0); URL.revokeObjectURL(u);
  save(c.toDataURL(fmt === "jpeg" ? "image/jpeg" : "image/png", 0.92));
}
const Opt = <T extends string>({ name, value, options, onChange }: { name: string; value: T; options: [T, string][]; onChange: (v: T) => void }) => <div className="qr-opts" role="radiogroup" aria-label={name}>{options.map(([v, l]) => <button type="button" key={v} role="radio" aria-checked={value === v} className={"iconbtn" + (value === v ? " on" : "")} onClick={() => onChange(v)}>{l}</button>)}</div>;
export function QrDesigner({ data, style, onChange }: { data: string; style: QrStyle; onChange: (s: QrStyle) => void }) {
  const [logoErr, setLogoErr] = useState("");
  const set = <K extends keyof QrStyle>(k: K, v: QrStyle[K]) => onChange({ ...style, [k]: v });
  const logo = (f: File | undefined) => { setLogoErr(""); if (!f) return; if (!/^image\/(png|jpeg|svg\+xml)$/.test(f.type)) return setLogoErr("Use a PNG, JPEG or SVG logo."); if (f.size > 150_000) return setLogoErr("Keep the logo under 150 KB."); const rd = new FileReader(); rd.onload = () => set("logo", String(rd.result)); rd.readAsDataURL(f); };
  return <div className="qr-des">
    <div className="qr-des__side"><QrPreview data={data} style={style} size={260} testId="qr-live" /><p className="ids-muted" style={{ fontSize: 12, margin: "8px 0 0", textAlign: "center" }}>Preview updates as you design. Test with your phone's camera before printing.</p></div>
    <div className="qr-des__form">
      <h3 className="ids-h3" style={{ fontSize: 15, margin: "0 0 8px" }}>Templates</h3><div className="qr-presets">{PRESETS.map(p => <button type="button" key={p.name} className="qr-preset" onClick={() => onChange({ ...style, ...p.style })}><QrPreview data="https://example.com" style={{ ...DEFAULT_STYLE, ...p.style }} size={56} /><span>{p.name}</span></button>)}</div>
      <h3 className="ids-h3" style={{ fontSize: 15, margin: "18px 0 8px" }}>Pattern</h3><Opt name="Pattern" value={style.pattern} options={[["square", "Square"], ["rounded", "Rounded"], ["dots", "Dots"]]} onChange={v => set("pattern", v)} />
      <h3 className="ids-h3" style={{ fontSize: 15, margin: "18px 0 8px" }}>Corners</h3><Opt name="Corners" value={style.corners} options={[["square", "Square"], ["rounded", "Rounded"], ["circle", "Circle"]]} onChange={v => set("corners", v)} />
      <h3 className="ids-h3" style={{ fontSize: 15, margin: "18px 0 8px" }}>Colors</h3><div className="qr-colors"><label>Code <input type="color" aria-label="Code color" value={style.fg} onChange={e => set("fg", e.target.value.toUpperCase())} /><code>{style.fg}</code></label><label>Background <input type="color" aria-label="Background color" value={style.bg} onChange={e => set("bg", e.target.value.toUpperCase())} /><code>{style.bg}</code></label></div>
      <h3 className="ids-h3" style={{ fontSize: 15, margin: "18px 0 8px" }}>Frame</h3><Opt name="Frame" value={style.frame} options={[["none", "None"], ["label", "Label"], ["box", "Border"]]} onChange={v => set("frame", v)} />
      {style.frame === "label" && <><label className="ids-label" htmlFor="qr-label">Frame text</label><input id="qr-label" className="ids-input" maxLength={24} value={style.label} onChange={e => set("label", e.target.value)} style={{ maxWidth: 260 }} /></>}
      <h3 className="ids-h3" style={{ fontSize: 15, margin: "18px 0 8px" }}>Logo</h3><div className="tb"><label className="iconbtn">{style.logo ? "Replace logo" : "Upload logo"}<input type="file" accept="image/png,image/jpeg,image/svg+xml" aria-label="Upload logo" style={{ display: "none" }} onChange={e => logo(e.target.files?.[0])} /></label>{style.logo && <button type="button" className="iconbtn" onClick={() => set("logo", null)}>Remove logo</button>}<span className="ids-muted" style={{ fontSize: 12 }}>PNG, JPEG or SVG, up to 150 KB. Error correction H keeps the code readable under a logo.</span></div>
      {logoErr && <p role="alert" style={{ color: "var(--ids-color-danger)", margin: "8px 0 0", fontSize: 13 }}>{logoErr}</p>}
    </div></div>;
}

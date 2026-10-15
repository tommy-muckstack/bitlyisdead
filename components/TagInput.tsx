"use client";
import { useState } from "react";
/** Chips + text box: Enter or comma adds a tag, Backspace on an empty box removes the last one. */
export function TagInput({ id, value, onChange, suggestions = [], placeholder = "Add a tag and press Enter" }: { id?: string; value: string[]; onChange: (t: string[]) => void; suggestions?: string[]; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => { const v = t.trim().replace(/\s+/g, " ").slice(0, 30); if (v && !value.some(x => x.toLowerCase() === v.toLowerCase()) && value.length < 10) onChange([...value, v]); setDraft(""); };
  const sugg = suggestions.filter(s => s.toLowerCase().includes(draft.toLowerCase()) && !value.some(v => v.toLowerCase() === s.toLowerCase())).slice(0, 6);
  return <div className="tg"><div className="tg-box">{value.map(t => <span key={t} className="tg-chip">{t}<button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(value.filter(x => x !== t))}>×</button></span>)}
    <input id={id} value={draft} placeholder={value.length ? "" : placeholder} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1)); }} onBlur={() => draft && add(draft)} /></div>
    {draft && sugg.length > 0 && <div className="tg-sugg">{sugg.map(s => <button type="button" key={s} onClick={() => add(s)}>{s}</button>)}</div>}</div>;
}

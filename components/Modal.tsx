"use client";
import { useEffect, useRef } from "react";
/** Styled dialog (replaces native confirm()). Escape / backdrop close it; focus lands on the primary action. */
export function Modal({ open, title, children, onClose, actions, wide }: { open: boolean; title: string; children?: React.ReactNode; onClose: () => void; actions?: React.ReactNode; wide?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); box.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(); return () => document.removeEventListener("keydown", k); }, [open, onClose]);
  if (!open) return null;
  return <div className="md-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={box} role="dialog" aria-modal="true" aria-labelledby="md-t" className={"md-box" + (wide ? " wide" : "")}>
      <div className="md-hd"><h2 id="md-t">{title}</h2><button type="button" className="md-x" aria-label="Close" onClick={onClose}>×</button></div>
      <div className="md-bd">{children}</div>
      {actions && <div className="md-ft">{actions}</div>}
    </div>
  </div>;
}
export function Confirm({ open, title, body, confirmLabel = "Delete", danger = true, onCancel, onConfirm }: { open: boolean; title: string; body: React.ReactNode; confirmLabel?: string; danger?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Modal open={open} title={title} onClose={onCancel} actions={<><button type="button" className="ids-btn ids-btn--outline" onClick={onCancel}>Cancel</button><button type="button" data-autofocus className={"ids-btn " + (danger ? "ids-btn--danger" : "ids-btn--primary")} onClick={onConfirm}>{confirmLabel}</button></>}>{body}</Modal>;
}

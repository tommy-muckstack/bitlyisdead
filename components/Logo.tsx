import { site } from "@/site.config";
import { Mark } from "@/components/Mark";
export function Logo({ size = 28, color }: { size?: number; color?: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--ids-font-display)", fontWeight: 700, fontSize: size * 0.72, letterSpacing: "var(--ids-type-tracking)", color }}>
    <Mark size={size} />{site.name}
  </span>;
}

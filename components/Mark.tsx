// BitlyIsDead brand mark: the IsDead tombstone (shared silhouette with the other clones) on Bitly orange. Original art.
export const BRAND = { orange: "#F36600", navy: "#031F39" };
export function Mark({ size = 28, rounded = true }: { size?: number; rounded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
    <rect width="32" height="32" rx={rounded ? 8 : 0} fill={BRAND.orange} />
    <g fill={BRAND.navy}><path d="M16 5.5a8 8 0 0 1 8 8V24H8V13.5a8 8 0 0 1 8-8z" /><rect x="5" y="23" width="22" height="4.5" rx="1.6" /></g>
    <path d="M12.2 11.8l7.6 7.6M19.8 11.8l-7.6 7.6" stroke={BRAND.orange} strokeWidth="2.6" strokeLinecap="round" fill="none" />
  </svg>;
}

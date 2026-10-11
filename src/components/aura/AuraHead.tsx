/** Compact Aura head used for the brand mark and small buttons (solid fills, no ids). */
export function AuraHead({ size = 36, className, eye = "#5fe3ff" }: { size?: number; className?: string; eye?: string }) {
  return (
    <svg viewBox="0 0 64 48" width={size} height={(size * 48) / 64} className={className} aria-hidden focusable="false">
      <path d="M32 2 C51 2 62 12 62 25 C62 38 49 46 32 46 C15 46 2 38 2 25 C2 12 13 2 32 2 Z" fill="#f4f7fc" stroke="#c9d4e5" strokeWidth="1.2" />
      <path d="M14 10 C18 6 23 4.5 28 4.2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 9 C46 9 54 16 54 25 C54 34 45 39 32 39 C19 39 10 34 10 25 C10 16 18 9 32 9 Z" fill="#0d1426" />
      <ellipse cx="23.5" cy="25" rx="4.2" ry="5.6" fill={eye} />
      <ellipse cx="40.5" cy="25" rx="4.2" ry="5.6" fill={eye} />
      <circle cx="22" cy="22.6" r="1.2" fill="#fff" opacity=".9" />
      <circle cx="39" cy="22.6" r="1.2" fill="#fff" opacity=".9" />
    </svg>
  );
}

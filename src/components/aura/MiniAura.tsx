import { cn } from "@/lib/cn";

/**
 * A tiny Aura drawn in the surrounding tone (--accent / --accent-ink), used beside section header
 * labels. She floats, blinks, glances toward the label and now and then waves (see .mini-aura in
 * app/tags.css). Pure SVG and CSS, so it works in server components; decorative.
 * `flip` mirrors her so she faces left (for the trace after a centred label).
 */
export function MiniAura({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 46" aria-hidden focusable="false" className={cn("mini-aura", flip && "-scale-x-100", className)}>
      <ellipse cx="20" cy="44" rx="7" ry="1.6" className="mini-aura-shadow" />
      <g className="mini-aura-bot">
        <ellipse cx="9.5" cy="31" rx="2.6" ry="4.4" className="mini-aura-shell" />
        <g className="mini-aura-wave">
          <ellipse cx="30.5" cy="31" rx="2.6" ry="4.4" className="mini-aura-shell" />
        </g>
        <ellipse cx="20" cy="31.5" rx="9.5" ry="8.5" className="mini-aura-shell" />
        <circle cx="20" cy="31" r="2.2" className="mini-aura-core" />
        <path d="M20 2.5 C31 2.5 36.5 8 36.5 14.5 C36.5 21 30 25 20 25 C10 25 3.5 21 3.5 14.5 C3.5 8 9 2.5 20 2.5 Z" className="mini-aura-shell" />
        <path d="M20 7 C28 7 31.5 10.5 31.5 14.5 C31.5 18.5 27 21 20 21 C13 21 8.5 18.5 8.5 14.5 C8.5 10.5 12 7 20 7 Z" className="mini-aura-visor" />
        <g className="mini-aura-eyes">
          <ellipse cx="15.5" cy="14.5" rx="2.1" ry="2.8" />
          <ellipse cx="24.5" cy="14.5" rx="2.1" ry="2.8" />
        </g>
      </g>
    </svg>
  );
}

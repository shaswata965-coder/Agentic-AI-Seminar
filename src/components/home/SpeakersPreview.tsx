import { Aura } from "@/components/aura/Aura";
import type { SiteSettings, Speaker } from "@/lib/content/types";


export function MoreSpeakersCard({ className, title, text }: { className?: string; title: string; text: string }) {
  return (
    <div className={`tone-lilac flex h-full min-h-[18rem] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[color-mix(in_oklab,var(--accent)_60%,transparent)] bg-accent-soft/60 p-6 text-center ${className ?? ""}`}>
      <Aura variant="speakers" size={120} lite />
      <p className="mt-3 font-display text-lg font-semibold text-fg">{title}</p>
      {text ? <p className="mt-1 text-sm text-muted">{text}</p> : null}
    </div>
  );
}

// The "Voices from academia and industry" section has been removed from the homepage
// in favor of the "Meet Our Speakers" carousel with the "Meet All 11 Speakers" CTA.
export function SpeakersPreview({ s, speakers }: { s?: SiteSettings; speakers?: Speaker[] }) {
  return null;
}


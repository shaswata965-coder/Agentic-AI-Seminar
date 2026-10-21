/* eslint-disable @next/next/no-img-element -- see Avatar.tsx */
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";

const LOGOS = {
  iitd: { src: "/logos/iit-delhi.svg", alt: "IIT Delhi", width: 237, height: 237, mono: false },
  scai: { src: "/logos/yardi-scai.png", alt: "Yardi School of Artificial Intelligence, IIT Delhi", width: 520, height: 38, mono: true },
};

/** The IIT Delhi emblem (vector, in its red), also pinned on Aura as her badge (AuraArt). */
export const IITD_EMBLEM = LOGOS.iitd.src;

/**
 * IIT Delhi and ScAI logos. The IIT Delhi emblem is drawn in its own red, so set it on a light disc; the bundled
 * ScAI wordmark is white on transparent, so it is drawn dark in light mode. A logo uploaded in Admin → Site settings →
 * Site-wide → Logos & images is shown as uploaded.
 * `monogram` shows only the "ScAI" letters of the wordmark, for narrow headers; `decorative` drops the
 * alt text when the name is written next to the logo.
 */
export function InstituteLogo({ kind, upload, monogram = false, decorative = false, className }: { kind: keyof typeof LOGOS; upload?: string; monogram?: boolean; decorative?: boolean; className?: string }) {
  const logo = LOGOS[kind];
  const crop = monogram && !upload;
  return (
    // The "ScAI" letters are the first 117 of the wordmark's 520 px.
    <span className={cn("flex shrink-0", crop && "aspect-[117/38] overflow-hidden", className)}>
      <img
        src={withBase(upload || logo.src)}
        alt={decorative ? "" : logo.alt}
        width={logo.width}
        height={logo.height}
        decoding="async"
        className={cn("h-full w-auto max-w-none", !upload && logo.mono && "brightness-0 dark:brightness-100")}
      />
    </span>
  );
}

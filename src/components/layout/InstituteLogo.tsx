/* eslint-disable @next/next/no-img-element -- see Avatar.tsx */
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";

const LOGOS = {
  iitd: { src: "/logos/iit-delhi.png", alt: "IIT Delhi", width: 70, height: 70 },
  scai: { src: "/logos/yardi-scai.png", alt: "Yardi School of Artificial Intelligence, IIT Delhi", width: 520, height: 38 },
};

/**
 * IIT Delhi and ScAI logos for the header. The bundled files are white on transparent, so they are
 * drawn dark in light mode. A logo uploaded in Admin → Site settings → Site-wide → Logos & images is shown as uploaded.
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
        className={cn("h-full w-auto max-w-none", !upload && "brightness-0 dark:brightness-100")}
      />
    </span>
  );
}

import { ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import type { Tone } from "@/lib/content/constants";

export function SiteBanner({ text, link, tone = "lilac" }: { text: string; link?: string; tone?: Tone }) {
  const inner = (
    <span className="inline-flex items-center gap-2">
      <Megaphone size={15} aria-hidden className="origin-bottom-left group-hover:animate-[mi-wiggle_0.6s_ease-in-out]" />
      <span>{text}</span>
      {link ? <ArrowRight size={15} aria-hidden /> : null}
    </span>
  );
  return (
    <div data-edit="site.banner" className={`tone-${tone} bg-accent-soft text-center text-sm font-semibold text-accent-ink`}>
      <div className="container-site py-2">
        {link ? (
          <Link href={link} className="group mi-link">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}

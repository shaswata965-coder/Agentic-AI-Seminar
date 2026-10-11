import { ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";

export function SiteBanner({ text, link }: { text: string; link?: string }) {
  const inner = (
    <span className="inline-flex items-center gap-2">
      <Megaphone size={15} aria-hidden />
      <span>{text}</span>
      {link ? <ArrowRight size={15} aria-hidden /> : null}
    </span>
  );
  return (
    <div className="tone-lilac bg-accent-soft text-center text-sm font-semibold text-accent-ink">
      <div className="container-site py-2">
        {link ? (
          <Link href={link} className="hover:underline">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}

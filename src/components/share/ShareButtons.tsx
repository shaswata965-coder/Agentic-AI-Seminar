"use client";

import { Link2, Share2 } from "lucide-react";
import { useSyncExternalStore } from "react";
import { FacebookIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "@/components/ui/BrandIcons";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const noop = () => () => {};

export function ShareButtons({ url, text, className, label = "Share" }: { url: string; text: string; className?: string; label?: string }) {
  const toast = useToast();
  const canShare = useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);
  const enc = encodeURIComponent;
  const targets = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`, Icon: XIcon },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, Icon: LinkedInIcon },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}`, Icon: WhatsAppIcon },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, Icon: FacebookIcon },
  ];
  const btn =
    "key key-line grid h-10 w-10 place-items-center rounded-xl border border-border-strong bg-surface text-muted hover:border-brand hover:text-brand";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Couldn't copy the link", "error");
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="mr-1 text-sm font-semibold text-subtle">{label}</span>
      {canShare ? (
        <button type="button" className={btn} data-ripple="" aria-label="Share via your device" onClick={() => navigator.share({ title: text, url }).catch(() => {})}>
          <Share2 size={17} aria-hidden />
        </button>
      ) : null}
      {targets.map(({ name, href, Icon }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={btn} data-ripple="" aria-label={`Share on ${name} (opens in a new tab)`}>
          <span className="btn-ico-l">
            <Icon size={17} />
          </span>
        </a>
      ))}
      <button type="button" className={btn} data-ripple="" data-pop="" aria-label="Copy link" onClick={copy}>
        <Link2 size={17} aria-hidden />
      </button>
    </div>
  );
}

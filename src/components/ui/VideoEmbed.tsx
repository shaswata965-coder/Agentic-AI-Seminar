"use client";

/* eslint-disable @next/next/no-img-element -- third-party thumbnail */
import { Play } from "lucide-react";
import { useState } from "react";

export function parseVideo(url: string): { kind: "youtube" | "vimeo"; id: string } | null {
  try {
    const u = new URL(url);
    if (/youtube\.com$/.test(u.hostname.replace(/^www\.|^m\./, "")) || u.hostname === "youtube.com") {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop();
      if (id && /^[\w-]{6,}$/.test(id)) return { kind: "youtube", id };
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (/^[\w-]{6,}$/.test(id)) return { kind: "youtube", id };
    }
    if (/vimeo\.com$/.test(u.hostname)) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return { kind: "vimeo", id };
    }
  } catch {}
  return null;
}

/** Lightweight click-to-play facade: no third-party scripts load until the visitor asks. */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [play, setPlay] = useState(false);
  const v = parseVideo(url);
  if (!v) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="grid aspect-video place-items-center rounded-2xl bg-surface-2 font-semibold text-brand">
        Watch video ↗
      </a>
    );
  }
  const src = v.kind === "youtube" ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0` : `https://player.vimeo.com/video/${v.id}?autoplay=1`;
  if (play) {
    return (
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-2xl border-0"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--lilac-soft),var(--aqua-soft))]"
      aria-label={`Play video: ${title}`}
    >
      {v.kind === "youtube" ? (
        <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : null}
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white/95 text-[#0f172a] shadow-card-lg transition-transform group-hover:scale-110">
        <Play size={26} aria-hidden fill="currentColor" className="ml-1" />
      </span>
    </button>
  );
}

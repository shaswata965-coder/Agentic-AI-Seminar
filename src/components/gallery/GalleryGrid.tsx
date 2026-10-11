"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Img } from "@/components/ui/Img";
import { Modal } from "@/components/ui/Modal";
import type { GalleryItem } from "@/lib/content/types";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length));
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const cur = open !== null ? items[open] : null;
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((it, i) => (
          <li key={it.id} className="mb-4 break-inside-avoid">
            <button type="button" onClick={() => setOpen(i)} className="group block w-full overflow-hidden rounded-3xl border border-border bg-surface text-left shadow-card">
              <Img src={it.image} alt={it.alt || it.caption || "Workshop photo"} className="w-full transition-transform duration-500 group-hover:scale-[1.03]" />
              {it.caption ? <span className="block px-4 py-3 text-sm text-muted">{it.caption}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      <Modal open={cur !== null} onClose={() => setOpen(null)} labelledBy="gallery-caption" size="xl">
        {cur ? (
          <figure className="p-3">
            <Img src={cur.image} alt={cur.alt || cur.caption || "Workshop photo"} className="max-h-[75dvh] w-full rounded-2xl object-contain" loading="eager" />
            <figcaption id="gallery-caption" className="flex items-center justify-between gap-3 px-2 pt-3 text-sm text-muted">
              <button type="button" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 hover:text-fg" aria-label="Previous photo">
                <ChevronLeft size={18} />
              </button>
              <span className="text-center">{cur.caption || `Photo ${open! + 1} of ${items.length}`}</span>
              <button type="button" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 hover:text-fg" aria-label="Next photo">
                <ChevronRight size={18} />
              </button>
            </figcaption>
          </figure>
        ) : null}
      </Modal>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Aura } from "@/components/aura/Aura";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHero } from "@/components/layout/PageHero";
import { TagScope } from "@/components/ui/Tag";
import { getGallery, getSettings } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Photo gallery", alternates: { canonical: absoluteUrl("/gallery") } };

export default async function GalleryPage() {
  const [s, items] = await Promise.all([getSettings(), getGallery()]);
  if (!s.showGallery) notFound();
  return (
    <TagScope style="label">
      <PageHero tone="peach" crumb="Photo gallery" eyebrow="Post-event" title="Photo gallery" aura="gallery" description={<p>Moments from the {s.eventName}.</p>} />
      <section className="tone-peach py-12 sm:py-16">
        <div className="container-site">
          {items.length ? (
            <GalleryGrid items={items} />
          ) : (
            <div className="card flex flex-col items-center p-10 text-center">
              <Aura variant="gallery" size={150} />
              <p className="mt-3 font-display text-xl font-semibold text-fg">Photos are on their way!</p>
            </div>
          )}
        </div>
      </section>
    </TagScope>
  );
}

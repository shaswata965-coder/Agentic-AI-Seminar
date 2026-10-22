import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Aura } from "@/components/aura/Aura";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHero } from "@/components/layout/PageHero";
import { TagScope } from "@/components/ui/Tag";
import { getGallery, getSettings, inPreview } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Photo gallery", alternates: { canonical: absoluteUrl("/gallery") } };

export default async function GalleryPage() {
  const [s, items, preview] = await Promise.all([getSettings(), getGallery(), inPreview()]);
  // Hidden until switched on after the event; the admin's live preview shows it anyway.
  if (!s.showGallery && !preview) notFound();
  const c = copy(s, "galleryHero");
  return (
    <TagScope style="label">
      <PageHero edit="gallery.hero" home={s.siteNav.home} tone={c.tone} crumb={c.crumb} eyebrow={c.eyebrow} title={c.title} aura="gallery" description={c.description} />
      <section data-edit="gallery.hero" className={`tone-${c.tone} py-12 sm:py-16`}>
        <div className="container-site">
          {items.length ? (
            <GalleryGrid items={items} />
          ) : (
            <div className="card flex flex-col items-center p-10 text-center">
              <Aura variant="gallery" size={150} />
              <p className="mt-3 font-display text-xl font-semibold text-fg">{c.empty}</p>
            </div>
          )}
        </div>
      </section>
    </TagScope>
  );
}

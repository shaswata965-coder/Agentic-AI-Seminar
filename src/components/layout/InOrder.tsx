import { Fragment, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/content/types";
import { shownSections, type OrderPage, type SectionKey } from "@/lib/schema/section-order";

/**
 * A page's movable sections (every one of them, by its Site settings key), in the order set in
 * Site settings → <page> → Section order, leaving out the ones switched off there. The page's hero
 * comes before them, outside.
 */
export function InOrder<P extends OrderPage>({ s, page, sections }: { s: SiteSettings; page: P; sections: Record<SectionKey<P>, ReactNode> }) {
  return shownSections(s, page).map((key) => <Fragment key={key}>{sections[key]}</Fragment>);
}

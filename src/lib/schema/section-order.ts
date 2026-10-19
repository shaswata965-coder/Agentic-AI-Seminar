/*
 * The sections of each page that can be moved in Admin → Site settings → <page> → Section order, in
 * their default order (the keys of the page's Site settings sections). Each page's hero stays at the
 * top; pages with a single section, or whose parts sit side by side (Registration), have nothing to
 * move. The order is stored per page in the settings as `<page>Order` (homeOrder, aboutOrder…), so a
 * volunteer given one page can move only that page's sections. Shared by client and server code.
 */

export const SECTION_ORDER = {
  home: ["highlights", "news", "themes", "about", "speakers", "hackathon", "venue", "partners", "faq"],
  about: ["motivation", "audience", "activities"],
  programme: ["overview", "schedule", "kiosks", "hackathon", "plan"],
  hackathon: ["overview", "tracks", "timeline", "prizes", "people", "resources", "rules", "results", "cta"],
  partners: ["list", "reach", "ways", "tiers"],
  venue: ["place", "routes", "stay"],
  organisers: ["faculty", "students", "volunteers"],
  meetAura: ["playground", "looks"],
} as const;

export type OrderPage = keyof typeof SECTION_ORDER;
export type SectionKey<P extends OrderPage> = (typeof SECTION_ORDER)[P][number];
/** The settings field holding a page's order. */
export type OrderField<P extends OrderPage = OrderPage> = `${P}Order`;
export type SectionOrders = { [P in OrderPage as OrderField<P>]: string[] };

export const orderField = <P extends OrderPage>(page: P) => `${page}Order` as OrderField<P>;
export const isOrderPage = (page: string): page is OrderPage => Object.hasOwn(SECTION_ORDER, page);

export const SECTION_ORDER_DEFAULTS = Object.fromEntries(Object.entries(SECTION_ORDER).map(([page, keys]) => [orderField(page as OrderPage), [...keys]])) as SectionOrders;

/**
 * A saved order made whole: only the known sections, each once, and any it doesn't list (a section added
 * to the site after the order was saved) put back after the section they follow by default.
 */
export function arrange<K extends string>(defaults: readonly K[], saved: unknown): K[] {
  const known = new Set<string>(defaults);
  const out: K[] = [];
  if (Array.isArray(saved)) for (const k of saved) if (typeof k === "string" && known.has(k) && !out.includes(k as K)) out.push(k as K);
  defaults.forEach((k, i) => {
    if (out.includes(k)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) if (out.includes(defaults[j])) {
      at = out.indexOf(defaults[j]) + 1;
      break;
    }
    out.splice(at, 0, k);
  });
  return out;
}

/** A page's movable sections in the order set in Site settings. */
export function sectionOrder<P extends OrderPage>(settings: Partial<SectionOrders>, page: P): SectionKey<P>[] {
  return arrange<SectionKey<P>>(SECTION_ORDER[page], settings[orderField(page)]);
}

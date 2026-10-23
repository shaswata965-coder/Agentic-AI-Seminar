/*
 * The sections of each page that can be moved in Admin → Site settings → <page> → Section order, in
 * their default order (the keys of the page's Site settings sections). Each page's hero stays at the
 * top; pages with a single section, or whose parts sit side by side (Registration), have nothing to
 * move. The order is stored per page in the settings as `<page>Order` (homeOrder, aboutOrder…), so a
 * volunteer given one page can move only that page's sections. Sections can also be hidden (below).
 * Shared by client and server code.
 */

export const SECTION_ORDER = {
  home: ["themes", "speakers", "hackathon", "news", "about", "highlights", "venue", "partners", "faq"],
  about: ["motivation", "audience", "activities"],
  programme: ["overview", "schedule", "kiosks", "hackathon", "plan"],
  hackathon: ["overview", "timeline", "tracks", "register", "judging", "people", "rules", "results", "cta"],
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

/*
 * The sections of each page that can be hidden, each with the switch at the top of its tab in Site settings:
 * every movable one, and the parts of the pages that have no Section order. The hero, which holds the page's
 * title, always shows. The keys of a page's hidden sections are stored as `<page>Hidden` (homeHidden,
 * speakersHidden…), so a volunteer given one page can hide only that page's sections.
 */
export const HIDEABLE_SECTIONS = {
  ...SECTION_ORDER,
  speakers: ["list"],
  tutorials: ["list"],
  register: ["form", "fees", "deadlines"],
} as const;

export type HidePage = keyof typeof HIDEABLE_SECTIONS;
/** The settings field holding the keys of a page's hidden sections. */
export type HiddenField<P extends HidePage = HidePage> = `${P}Hidden`;
export type HiddenSections = { [P in HidePage as HiddenField<P>]: string[] };

export const hiddenField = <P extends HidePage>(page: P) => `${page}Hidden` as HiddenField<P>;
export const isHidePage = (page: string): page is HidePage => Object.hasOwn(HIDEABLE_SECTIONS, page);
/** Whether a page's section has a switch to hide it. */
export const canHide = (page: string, key: string) => isHidePage(page) && (HIDEABLE_SECTIONS[page] as readonly string[]).includes(key);

export const HIDDEN_SECTIONS_DEFAULTS = Object.fromEntries(Object.keys(HIDEABLE_SECTIONS).map((page) => [hiddenField(page as HidePage), []])) as unknown as HiddenSections;

/** Whether a section shows on its page, i.e. it isn't hidden in Site settings. */
export function isShown(settings: Partial<HiddenSections>, page: HidePage, key: string): boolean {
  const hidden = settings[hiddenField(page)];
  return !(Array.isArray(hidden) && hidden.includes(key));
}

/** A page's movable sections in the order set in Site settings, without the hidden ones. */
export function shownSections<P extends OrderPage>(settings: Partial<SectionOrders & HiddenSections>, page: P): SectionKey<P>[] {
  return sectionOrder(settings, page).filter((key) => isShown(settings, page, key));
}

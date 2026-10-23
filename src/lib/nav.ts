import type { PageCopy } from "@/lib/schema/page-copy";

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Names from Site settings → Site-wide → Navigation. */
export type NavCopy = PageCopy["siteNav"];

export const homeNav = (n: NavCopy): NavItem => ({ href: "/", label: n.home });

/** Dedicated pages shown as links in the navigation bar (after Home); the Hackathon only while it is shown. */
export const primaryNav = (n: NavCopy, hackathon: boolean): NavItem[] => [
  { href: "/programme", label: n.programme },
  { href: "/speakers", label: n.speakers },
  ...(hackathon ? [{ href: "/hackathon", label: n.hackathon }] : []),
];

export const registrationNav = (n: NavCopy): NavItem => ({ href: "/register", label: n.registration });

/** Dedicated pages listed under Explore, next to the home page sections. */
export const explorePages = (n: NavCopy): NavItem[] => [
  { href: "/about", label: n.about, description: n.aboutText },
  { href: "/tutorials", label: n.tutorials, description: n.tutorialsText },
  { href: "/venue", label: n.venue, description: n.venueText },
  { href: "/partners", label: n.partners, description: n.partnersText },
  { href: "/organisers", label: n.organisers, description: n.organisersText },
];

/** Sections of the single-scroll home page, by their Site settings keys (the contact form is in the FAQ), leaving out the `hidden` ones. */
export const sectionNav = (n: NavCopy, hidden: readonly string[] = []): NavItem[] =>
  (
    [
      ["themes", { href: "/#themes", label: n.themes, description: n.themesText }],
      ["venue", { href: "/#venue", label: n.routeMap, description: n.routeMapText }],
      ["faq", { href: "/#faq", label: n.faq, description: n.faqText }],
      ["faq", { href: "/#contact", label: n.contact, description: n.contactText }],
    ] as const
  )
    .filter(([key]) => !hidden.includes(key))
    .map(([, item]) => item);

export function postEventNav(flags: { showGallery: boolean; showTalks: boolean }, n: NavCopy): NavItem[] {
  return [
    ...(flags.showGallery ? [{ href: "/gallery", label: n.gallery, description: n.galleryText }] : []),
    ...(flags.showTalks ? [{ href: "/talks", label: n.talks, description: n.talksText }] : []),
  ];
}

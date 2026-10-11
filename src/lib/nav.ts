export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Dedicated pages shown as links in the navigation bar (after Home). */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/programme", label: "Programme" },
  { href: "/speakers", label: "Speakers" },
  { href: "/tutorials", label: "Tutorials & Demos" },
  { href: "/hackathon", label: "Hackathon" },
];

export const HOME_NAV: NavItem = { href: "/", label: "Home" };

/** Dedicated pages listed under Explore, with the home page sections. */
export const EXPLORE_PAGES: NavItem[] = [{ href: "/organisers", label: "Organisers", description: "Faculty, student organisers and volunteers" }];

/** Sections of the single-scroll home page. */
export const SECTION_NAV: NavItem[] = [
  { href: "/#about", label: "About", description: "Why this workshop, what agentic AI is, who should attend" },
  { href: "/#themes", label: "Themes", description: "Healthcare, scientific discovery and entrepreneurship" },
  { href: "/#kiosks", label: "Industry kiosks", description: "Companies showcasing agentic technology" },
  { href: "/#venue", label: "Venue & travel", description: "Map, directions, campus entry and stays" },
  { href: "/#partners", label: "Partners & sponsors", description: "Logo wall, tiers and sponsor enquiries" },
  { href: "/#faq", label: "FAQ & contact", description: "Common questions, e-mail and contact form" },
];

export function postEventNav(flags: { showGallery: boolean; showTalks: boolean }): NavItem[] {
  return [
    ...(flags.showGallery ? [{ href: "/gallery", label: "Photo gallery", description: "Moments from the workshop" }] : []),
    ...(flags.showTalks ? [{ href: "/talks", label: "Slides & recordings", description: "Catch up on the talks" }] : []),
  ];
}

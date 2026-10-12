export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Dedicated pages shown as links in the navigation bar (after Home). */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/programme", label: "Programme" },
  { href: "/speakers", label: "Speakers" },
];

export const HOME_NAV: NavItem = { href: "/", label: "Home" };

/** Dedicated pages listed under Explore, next to the home page sections. */
export const EXPLORE_PAGES: NavItem[] = [
  { href: "/tutorials", label: "Tutorials & Demos", description: "Hands-on sessions and live agent demos" },
  { href: "/hackathon", label: "Hackathon", description: "Tracks, rules, prizes and team registration" },
  { href: "/venue", label: "Venue & travel", description: "Directions, campus entry, stays and local tips" },
  { href: "/partners", label: "Partners & sponsors", description: "Our partners, sponsorship tiers and how to join them" },
  { href: "/organisers", label: "Organisers", description: "Faculty, student organisers and volunteers" },
];

/** Sections of the single-scroll home page. */
export const SECTION_NAV: NavItem[] = [
  { href: "/#themes", label: "Themes", description: "Healthcare, scientific discovery and entrepreneurship" },
  { href: "/#venue", label: "Route map", description: "Follow the route to campus on the map" },
  { href: "/#faq", label: "FAQ", description: "Registration, travel, the hackathon and more" },
  { href: "/#contact", label: "Contact", description: "E-mail, social links and the contact form" },
];

export function postEventNav(flags: { showGallery: boolean; showTalks: boolean }): NavItem[] {
  return [
    ...(flags.showGallery ? [{ href: "/gallery", label: "Photo gallery", description: "Moments from the workshop" }] : []),
    ...(flags.showTalks ? [{ href: "/talks", label: "Slides & recordings", description: "Catch up on the talks" }] : []),
  ];
}

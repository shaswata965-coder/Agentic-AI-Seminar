import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { ShareButtons } from "@/components/share/ShareButtons";
import { InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/ui/BrandIcons";
import type { SiteSettings } from "@/lib/content/types";
import { brandName, eventCalendarLinks, hackathonRegistrationHref, registrationHref, venueLine } from "@/lib/event";
import { copy } from "@/lib/copy";
import { formatDateRange } from "@/lib/format";
import { explorePages, homeNav, postEventNav, primaryNav, registrationNav, sectionNav } from "@/lib/nav";
import { absoluteUrl } from "@/lib/paths";
import { isShown } from "@/lib/schema/section-order";
import { BrandMark } from "./BrandMark";

export function SocialLinks({ s, className }: { s: SiteSettings; className?: string }) {
  const items = [
    { href: s.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: s.x, label: "X (Twitter)", Icon: XIcon },
    { href: s.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: s.youtube, label: "YouTube", Icon: YouTubeIcon },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <ul className={className ?? "flex gap-2"}>
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            data-ripple=""
            className="key key-line grid h-10 w-10 place-items-center rounded-xl border border-border-strong bg-surface text-muted hover:border-brand hover:text-brand"
          >
            <span className="btn-ico-l">
              <Icon size={17} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SiteFooter({ s }: { s: SiteSettings }) {
  // mi-underline draws the underline in and handles the colour transition too.
  const linkCls = "mi-underline text-[15px] text-muted hover:text-fg";
  const c = copy(s, "siteFooter");
  const nav = s.siteNav;
  const involve = [
    { href: registrationHref(s), label: c.register },
    { href: hackathonRegistrationHref(s), label: c.hackathon },
    { href: "/programme#kiosks", label: c.exhibit },
    { href: "/partners#become-a-partner", label: c.partner },
    // The contact form is in the home page's FAQ section.
    ...(isShown(s, "home", "faq") ? [{ href: "/#contact", label: c.contact }] : []),
  ];
  return (
    <footer data-site-footer data-edit="site.footer" className="fit-screen relative mt-10 overflow-hidden border-t border-border bg-bg-soft">
      <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="container-site relative grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <BrandMark {...brandName(s)} />
          <p className="mt-4 max-w-sm text-[15px] text-muted">{s.tagline}</p>
          <ul className="mt-5 space-y-2 text-[15px] text-muted">
            <li className="flex gap-2">
              <CalendarDays size={18} aria-hidden className="mt-0.5 shrink-0 text-subtle" />
              <span>{formatDateRange(s.startDate, s.endDate)}</span>
            </li>
            <li className="flex gap-2">
              <MapPin size={18} aria-hidden className="mt-0.5 shrink-0 text-subtle" />
              <span>{venueLine(s)}</span>
            </li>
            {s.contactEmail ? (
              <li className="flex gap-2">
                <Mail size={18} aria-hidden className="mt-0.5 shrink-0 text-subtle" />
                <a className="mi-underline hover:text-fg" href={`mailto:${s.contactEmail}`}>
                  {s.contactEmail}
                </a>
              </li>
            ) : null}
            {s.contactPhone ? (
              <li className="flex gap-2">
                <Phone size={18} aria-hidden className="mt-0.5 shrink-0 text-subtle" />
                <a className="mi-underline hover:text-fg" href={`tel:${s.contactPhone.replace(/\s+/g, "")}`}>
                  {s.contactPhone}
                </a>
              </li>
            ) : null}
          </ul>
          <div className="mt-5 grid justify-items-start gap-3">
            <AddToCalendar links={eventCalendarLinks(s)} variant="outline" size="sm" />
            <ShareButtons url={absoluteUrl("/")} text={`${s.eventName} at IIT Delhi, ${formatDateRange(s.startDate, s.endDate)}`} />
          </div>
          <SocialLinks s={s} className="mt-5 flex gap-2" />
        </div>
        <nav aria-label="Pages">
          <h2 className="font-display text-sm font-bold tracking-[0.12em] text-fg uppercase">{c.pagesHeading}</h2>
          <ul className="mt-4 space-y-2.5">
            {[homeNav(nav), ...primaryNav(nav), ...explorePages(nav), registrationNav(nav)].map((i) => (
              <li key={i.href}>
                <Link className={linkCls} href={i.href}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Explore">
          <h2 className="font-display text-sm font-bold tracking-[0.12em] text-fg uppercase">{c.exploreHeading}</h2>
          <ul className="mt-4 space-y-2.5">
            {[...sectionNav(nav, s.homeHidden), ...postEventNav(s, nav), { href: "/meet-aura", label: nav.meetAura }].map((i) => (
              <li key={i.href}>
                <Link className={linkCls} href={i.href}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-display text-sm font-bold tracking-[0.12em] text-fg uppercase">{c.involveHeading}</h2>
          <ul className="mt-4 space-y-2.5">
            {involve.map((i) => (
              <li key={i.label}>
                <Link className={linkCls} href={i.href}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-end gap-3">
            <Aura variant="sleep" size={92} interactive sleepWhenIdle={false} bubbleSide="left" lite />
          </div>
        </div>
      </div>
      <div className="relative border-t border-border">
        <div className="container-site flex flex-col gap-3 py-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>{c.copyright}</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link className="mi-underline hover:text-fg" href="/meet-aura">
              {c.meetAura}
            </Link>
            <Link className="mi-underline hover:text-fg" href="/admin" prefetch={false}>
              {c.login}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

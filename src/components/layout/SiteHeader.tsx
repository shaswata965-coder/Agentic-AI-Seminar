"use client";

import { ChevronDown, Menu, Ticket, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AccountButton } from "@/components/account/Account";
import { Aura } from "@/components/aura/Aura";
import { ButtonLink } from "@/components/ui/Button";
import { useScrollLock } from "@/lib/client-hooks";
import { cn } from "@/lib/cn";
import { explorePages as explorePagesOf, homeNav, primaryNav, registrationNav, sectionNav, type NavCopy, type NavItem } from "@/lib/nav";
import type { PageCopy } from "@/lib/schema/page-copy";
import { InstituteLogo } from "./InstituteLogo";
import { ThemeToggle } from "./ThemeToggle";

export interface SiteHeaderProps {
  /** Logos uploaded under Admin → Branding; empty uses the bundled ones. */
  logos: { iitd: string; scai: string };
  registerHref: string;
  extraNav: NavItem[];
  /** Names from Site settings → Site-wide → Navigation and Header. */
  nav: NavCopy;
  text: PageCopy["siteHeader"];
  /** The home page's sections switched off in Site settings → Home, left out of the Explore menu. */
  homeHidden: string[];
  /** Whether the hackathon is on the site (its link and the phone menu's button). */
  hackathon: boolean;
}

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ logos, registerHref, extraNav, nav, text, homeHidden, hackathon }: SiteHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const explorePages = [...explorePagesOf(nav), ...extraNav];
  const homeSections = sectionNav(nav, homeHidden);
  const exploreItems = [...explorePages, ...homeSections];
  const pages = [homeNav(nav), ...primaryNav(nav, hackathon), registrationNav(nav)];
  const exploreActive = explorePages.some((item) => isActive(pathname, item.href));
  // Phones: logo, then the buttons pushed right. Desktop: three columns, so the links and Register sit centred between the logos.
  const barCls = "flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:grid lg:h-[72px] lg:grid-cols-[1fr_auto_1fr] xl:px-8";
  const iitdLogo = (
    <Link href="/" aria-label="IIT Delhi, home page" className="group/logo flex items-center gap-2.5 justify-self-start rounded-full pr-2">
      <span className="rounded-full bg-[conic-gradient(from_210deg,var(--azure),var(--lilac),var(--blush),var(--mint),var(--azure))] p-[2px] shadow-card transition-[rotate,scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/logo:scale-105 group-hover/logo:rotate-12">
        <span className="flex rounded-full bg-white p-[3px]">
          <InstituteLogo kind="iitd" upload={logos.iitd} decorative className="h-10 lg:h-12" />
        </span>
      </span>
      <span className="font-display text-lg leading-none font-extrabold tracking-tight whitespace-nowrap text-fg lg:text-xl">
        IIT <span className="text-gradient">Delhi</span>
      </span>
    </Link>
  );
  // The full ScAI wordmark where the header has room, otherwise just its "ScAI" letters.
  const scaiLogo = (
    <div className="flex justify-self-end">
      <InstituteLogo kind="scai" upload={logos.scai} monogram className="h-6 min-[1360px]:hidden" />
      <InstituteLogo kind="scai" upload={logos.scai} className="hidden h-6 min-[1360px]:flex" />
    </div>
  );
  const exploreLink = (item: NavItem, i: number) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setExploreOpen(false)}
      aria-current={isActive(pathname, item.href) ? "page" : undefined}
      style={{ "--i": i } as CSSProperties}
      className={cn("group block rounded-2xl p-3 transition-colors hover:bg-accent-soft", ["tone-mint", "tone-lilac", "tone-peach", "tone-aqua", "tone-butter", "tone-blush"][i % 6])}
    >
      <span className="flex items-center gap-2 font-display text-[15px] font-semibold text-fg transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent-ink">
        <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--accent)] transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-150" />
        {item.label}
      </span>
      {item.description ? <span className="mt-1 block text-[13px] leading-snug text-muted">{item.description}</span> : null}
    </Link>
  );

  // Glass background + reading progress bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      headerRef.current?.style.setProperty("--progress", max > 0 ? String(Math.min(1, y / max)) : "0");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setExploreOpen(false);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!exploreOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!exploreRef.current?.contains(e.target as Node)) setExploreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExploreOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [exploreOpen]);

  useScrollLock(menuOpen);
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (menuOpen && !d.open) d.showModal();
    if (!menuOpen && d.open) d.close();
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      data-site-header
      data-edit="site.header"
      className={cn(
        "fit-header sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "border-b border-border bg-[var(--header-bg)] shadow-[0_8px_30px_-20px_rgb(15_23_42/0.35)] backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className={barCls}>
        {iitdLogo}

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {[homeNav(nav), ...primaryNav(nav, hackathon)].map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-lg px-3 py-2 text-[14.5px] font-semibold whitespace-nowrap transition-colors",
                  active ? "text-brand" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full transition-[scale,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    active ? "bg-brand" : "scale-x-0 bg-border-strong group-hover:scale-x-100 group-focus-visible:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
          <div ref={exploreRef} className="relative">
            <button
              type="button"
              aria-expanded={exploreOpen}
              aria-controls="explore-menu"
              onClick={() => setExploreOpen((v) => !v)}
              data-ripple=""
              className={cn("inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[14.5px] font-semibold transition-colors hover:bg-surface-2 hover:text-fg", exploreOpen ? "bg-surface-2 text-fg" : exploreActive ? "text-brand" : "text-muted")}
            >
              {text.explore}
              <ChevronDown size={16} aria-hidden className={cn("transition-transform duration-300", exploreOpen && "rotate-180")} />
            </button>
            {exploreOpen ? (
              <div
                id="explore-menu"
                className={cn("absolute top-full left-1/2 mt-3 -translate-x-1/2 origin-top animate-pop rounded-3xl border border-border bg-surface p-3 shadow-card-lg", homeSections.length ? "w-[40rem]" : "w-[18rem]")}
              >
                <div className={cn("mi-stagger grid gap-2", homeSections.length && "grid-cols-[0.85fr_1.15fr]")}>
                  <div className="rounded-2xl bg-surface-2 p-1">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">{text.pagesHeading}</p>
                    {explorePages.map((item, i) => exploreLink(item, i))}
                  </div>
                  {homeSections.length ? (
                    <div>
                      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">{text.sectionsHeading}</p>
                      <div className="grid grid-cols-2">{homeSections.map((item, i) => exploreLink(item, explorePages.length + i))}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
          <span aria-hidden className="mx-1 hidden h-6 w-px bg-border lg:block" />
          {/* On phones the theme switch lives in the menu, and Register shrinks to its icon. */}
          <ThemeToggle className="max-sm:hidden" />
          <AccountButton className="max-sm:hidden" />
          <ButtonLink href={registerHref} size="sm" className="max-sm:w-9 max-sm:px-0" icon={<Ticket size={16} aria-hidden />}>
            <span className="max-sm:sr-only">{text.register}</span>
          </ButtonLink>
          <button
            type="button"
            data-ripple=""
            className="key key-line grid h-10 w-10 place-items-center rounded-xl border border-border-strong bg-surface text-fg lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} aria-hidden />
          </button>
        </div>
        {scaiLogo}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[linear-gradient(90deg,var(--brand),var(--lilac),var(--blush))]"
        style={{ transform: "scaleX(var(--progress, 0))" }}
      />

      <dialog
        ref={dialogRef}
        onClose={() => setMenuOpen(false)}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-fg open:animate-fade-up backdrop:bg-transparent"
      >
        {menuOpen ? (
          <div className="flex min-h-full flex-col">
            <div className={barCls}>
              {iitdLogo}
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  data-ripple=""
                  className="group key key-line grid h-10 w-10 place-items-center rounded-xl border border-border-strong bg-surface"
                  aria-label="Close menu"
                >
                  <X size={20} aria-hidden className="transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </div>
              {scaiLogo}
            </div>
            <nav aria-label="Mobile" className="container-site grid gap-8 pt-4 pb-6">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.14em] text-subtle uppercase">{text.pagesHeading}</p>
                <ul className="mi-stagger grid gap-1">
                  {pages.map((item, i) => (
                    <li key={item.href} style={{ "--i": i } as CSSProperties}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className={cn(
                          "block rounded-2xl px-3 py-2.5 font-display text-xl font-semibold transition-colors hover:bg-surface-2",
                          pathname === item.href && "text-brand",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.14em] text-subtle uppercase">{text.explore}</p>
                <ul className="mi-stagger grid grid-cols-2 gap-2">
                  {exploreItems.map((item, i) => (
                    <li key={item.href} style={{ "--i": pages.length + i } as CSSProperties}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        data-ripple=""
                        className={cn(
                          "block rounded-2xl bg-accent-soft px-3 py-3 text-[15px] font-semibold text-accent-ink",
                          ["tone-mint", "tone-lilac", "tone-peach", "tone-aqua", "tone-butter", "tone-blush"][i % 6],
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <AccountButton wide onNavigate={() => setMenuOpen(false)} className="sm:hidden" />
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href={registerHref} size="lg" onClick={() => setMenuOpen(false)} icon={<Ticket size={18} aria-hidden />}>
                  {text.registerNow}
                </ButtonLink>
                {hackathon ? (
                  <ButtonLink href="/hackathon" variant="outline" size="lg" onClick={() => setMenuOpen(false)}>
                    {text.joinHackathon}
                  </ButtonLink>
                ) : null}
              </div>
            </nav>
            <div className="mt-auto flex justify-center pb-6">
              <Aura variant="organisers" size={120} lite />
            </div>
          </div>
        ) : null}
      </dialog>
    </header>
  );
}

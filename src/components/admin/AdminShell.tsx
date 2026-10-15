"use client";

import {
  BookOpen,
  CalendarDays,
  CircleQuestionMark,
  ExternalLink,
  GraduationCap,
  Handshake,
  HandHeart,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Mic,
  MonitorPlay,
  Settings,
  Store,
  Ticket,
  Trophy,
  UserCog,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, Suspense, useContext, useState, type ReactNode } from "react";
import { AuraHead } from "@/components/aura/AuraHead";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";
import { can, contentPermission, SETTINGS_PERMISSIONS, type Permission, type Role } from "@/lib/permissions";
import { api, useApi } from "./api";

export interface AdminMe {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Volunteers only. */
  responsibility: string;
  permissions: Permission[];
}

const MeContext = createContext<AdminMe | null>(null);
export const useMe = () => useContext(MeContext);

const EventNameContext = createContext("");
/** The event name from Site settings. */
export const useEventName = () => useContext(EventNameContext);

interface Item {
  href: string;
  label: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
  /** What a volunteer needs to see this item (any one of these). Items without one are for everyone. */
  permission?: Permission | readonly Permission[];
}
const content = (key: string, label: string, Icon: LucideIcon): Item => ({ href: `/admin/content/${key}`, label, Icon, permission: contentPermission(key) });
const NAV: { title: string; items: Item[] }[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard }] },
  {
    title: "Event",
    items: [
      { href: "/admin/settings", label: "Site settings", Icon: Settings, permission: SETTINGS_PERMISSIONS },
      { href: "/admin/hackathon", label: "Hackathon", Icon: Trophy, permission: "hackathon" },
      content("announcements", "Announcements", Megaphone),
    ],
  },
  {
    title: "Programme",
    items: [content("sessions", "Programme", CalendarDays), content("speakers", "Speakers", Mic), content("tutorials", "Tutorials", GraduationCap), content("demos", "Demos", MonitorPlay)],
  },
  {
    title: "Content",
    items: [content("people", "Organisers & volunteers", Users), content("kiosks", "Industry kiosks", Store), content("sponsors", "Partners & sponsors", Handshake), content("faqs", "FAQs", CircleQuestionMark)],
  },
  {
    title: "Post-event",
    items: [content("gallery", "Photo gallery", Images), content("talks", "Slides & recordings", Video)],
  },
  {
    title: "Responses",
    items: [
      { href: "/admin/registrations", label: "Registrations", Icon: Ticket, permission: "registrations" },
      { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox, permission: "enquiries" },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin/media", label: "Media library", Icon: Images, permission: "media" },
      { href: "/admin/users", label: "Users", Icon: UserCog, adminOnly: true },
      { href: "/admin/volunteers", label: "Volunteers", Icon: HandHeart, adminOnly: true },
      { href: "/admin/tracker", label: "Task tracker", Icon: ListChecks, adminOnly: true },
      { href: "/admin/account", label: "My account", Icon: KeyRound },
      { href: "/admin/guide", label: "Help guide", Icon: BookOpen },
    ],
  },
];

const isActive = (href: string, pathname: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

/** Whether the signed-in user may open a sidebar item. While they are loading, hide only admin pages. */
function allowed(me: AdminMe | null, item: Item) {
  if (!me) return !item.adminOnly;
  if (item.adminOnly) return me.role === "admin";
  return !item.permission || can(me, item.permission);
}

type NavProps = { me: AdminMe | null; onNavigate?: () => void };

// usePathname() suspends while a route with an unknown param is prerendered
// (e.g. the /admin/content/[resource] shell), so the links render without the
// active state until the pathname is known.
function NavList(props: NavProps) {
  return (
    <Suspense fallback={<NavItems {...props} pathname={null} />}>
      <ActiveNavItems {...props} />
    </Suspense>
  );
}

function ActiveNavItems(props: NavProps) {
  return <NavItems {...props} pathname={usePathname()} />;
}

function NavItems({ me, onNavigate, pathname }: NavProps & { pathname: string | null }) {
  return (
    <nav aria-label="Admin" className="grid gap-5">
      {NAV.filter((g) => g.items.some((i) => allowed(me, i))).map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">{g.title}</p>
          <ul className="mt-1.5 grid gap-0.5">
            {g.items
              .filter((i) => allowed(me, i))
              .map(({ href, label, Icon }) => {
                const active = pathname !== null && isActive(href, pathname);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-[color,background-color,translate,box-shadow] duration-200",
                        active ? "bg-brand text-brand-fg shadow-sm" : "text-muted hover:translate-x-1 hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <span className="btn-ico-l">
                        <Icon size={17} aria-hidden />
                      </span>
                      {label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ eventName, shortName, children }: { eventName: string; shortName: string; children: ReactNode }) {
  const { data: me } = useApi<AdminMe>("/auth/me");
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = withBase("/admin/login");
  }

  const brand = (
    <Link href="/admin" className="group/brand flex items-center gap-2.5 px-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--azure-soft),var(--lilac-soft))] ring-1 ring-border transition-[rotate,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/brand:scale-105 group-hover/brand:-rotate-6">
        <AuraHead size={30} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-bold text-fg">{shortName || eventName}</span>
        <span className="block text-xs font-semibold text-subtle">Content manager</span>
      </span>
    </Link>
  );

  const footer = (
    <div className="grid gap-2 border-t border-border pt-4">
      <a href={withBase("/")} target="_blank" rel="noopener noreferrer" className="mi-link flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg">
        <ExternalLink size={16} aria-hidden /> View website
      </a>
      <div className="flex items-center gap-2 px-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{me?.name || me?.email || "…"}</p>
          <p className="text-xs text-subtle capitalize">{me?.role ?? ""}</p>
        </div>
        <ThemeToggle />
        <button type="button" onClick={logout} data-ripple="" className="group grid h-10 w-10 place-items-center rounded-full border border-border text-muted hover:border-blush-ink hover:text-blush-ink" aria-label="Sign out" title="Sign out">
          <LogOut size={17} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );

  return (
    <MeContext.Provider value={me}>
      <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[17rem_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto border-r border-border bg-surface py-5 pr-3 pl-3 lg:flex">
          {brand}
          <div className="flex-1">
            <NavList me={me} />
          </div>
          {footer}
        </aside>

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-[var(--header-bg)] px-4 backdrop-blur-xl lg:hidden">
          {brand}
          <button type="button" onClick={() => setOpen(true)} data-ripple="" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface" aria-label="Open admin menu" aria-expanded={open}>
            <Menu size={20} aria-hidden />
          </button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" className="absolute inset-0 bg-[rgb(10_15_30/0.45)]" onClick={() => setOpen(false)} aria-label="Close menu" />
            <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] animate-fade-up flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-card-lg">
              <div className="flex items-center justify-between">
                {brand}
                <button type="button" onClick={() => setOpen(false)} data-ripple="" className="group grid h-10 w-10 place-items-center rounded-full border border-border" aria-label="Close menu">
                  <X size={18} aria-hidden className="transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </div>
              <div className="flex-1">
                <NavList me={me} onNavigate={() => setOpen(false)} />
              </div>
              {footer}
            </div>
          </div>
        ) : null}

        <main id="main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
          <EventNameContext.Provider value={eventName}>
            <Suspense fallback={<div className="card p-10 text-center text-muted">Loading…</div>}>
              <PageGate me={me}>{children}</PageGate>
            </Suspense>
          </EventNameContext.Provider>
        </main>
      </div>
    </MeContext.Provider>
  );
}

/** Shows a "no access" panel instead of a page the signed-in user can't use (the API refuses it anyway). */
function PageGate({ me, children }: { me: AdminMe | null; children: ReactNode }) {
  const pathname = usePathname();
  const item = NAV.flatMap((g) => g.items)
    .filter((i) => isActive(i.href, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!me || !item || allowed(me, item)) return children;
  return (
    <div className="card mx-auto mt-6 flex max-w-xl flex-col items-center p-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-subtle ring-1 ring-border">
        <Lock size={24} aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold text-fg">{item.label} isn&apos;t available to you</h1>
      <p className="mt-2 text-muted">
        {item.adminOnly ? "Only administrators can open this page." : "Your volunteer account doesn't include this area. Ask an administrator if you need it."}
      </p>
      <Link href="/admin" className="mt-5 text-sm font-semibold text-brand underline">
        Back to the dashboard
      </Link>
    </div>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-bold text-fg">{title}</h1>
        {description ? <div className="mt-1.5 max-w-3xl text-[15px] text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

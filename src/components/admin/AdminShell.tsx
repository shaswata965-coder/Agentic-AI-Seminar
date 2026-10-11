"use client";

import {
  BookOpen,
  CalendarDays,
  CircleQuestionMark,
  ExternalLink,
  GraduationCap,
  Handshake,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
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
import { api, useApi } from "./api";

export interface AdminMe {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

const MeContext = createContext<AdminMe | null>(null);
export const useMe = () => useContext(MeContext);

interface Item {
  href: string;
  label: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
}
const NAV: { title: string; items: Item[] }[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard }] },
  {
    title: "Event",
    items: [
      { href: "/admin/settings", label: "Site settings", Icon: Settings },
      { href: "/admin/hackathon", label: "Hackathon", Icon: Trophy },
      { href: "/admin/content/announcements", label: "Announcements", Icon: Megaphone },
    ],
  },
  {
    title: "Programme",
    items: [
      { href: "/admin/content/sessions", label: "Programme", Icon: CalendarDays },
      { href: "/admin/content/speakers", label: "Speakers", Icon: Mic },
      { href: "/admin/content/tutorials", label: "Tutorials", Icon: GraduationCap },
      { href: "/admin/content/demos", label: "Demos", Icon: MonitorPlay },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content/people", label: "Organisers & volunteers", Icon: Users },
      { href: "/admin/content/kiosks", label: "Industry kiosks", Icon: Store },
      { href: "/admin/content/sponsors", label: "Partners & sponsors", Icon: Handshake },
      { href: "/admin/content/faqs", label: "FAQs", Icon: CircleQuestionMark },
    ],
  },
  {
    title: "Post-event",
    items: [
      { href: "/admin/content/gallery", label: "Photo gallery", Icon: Images },
      { href: "/admin/content/talks", label: "Slides & recordings", Icon: Video },
    ],
  },
  {
    title: "Responses",
    items: [
      { href: "/admin/registrations", label: "Registrations", Icon: Ticket },
      { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin/media", label: "Media library", Icon: Images },
      { href: "/admin/users", label: "Users", Icon: UserCog, adminOnly: true },
      { href: "/admin/account", label: "My account", Icon: KeyRound },
      { href: "/admin/guide", label: "Help guide", Icon: BookOpen },
    ],
  },
];

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
      {NAV.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">{g.title}</p>
          <ul className="mt-1.5 grid gap-0.5">
            {g.items
              .filter((i) => !i.adminOnly || me?.role === "admin")
              .map(({ href, label, Icon }) => {
                const active = pathname !== null && (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                        active ? "bg-brand text-brand-fg shadow-sm" : "text-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <Icon size={17} aria-hidden />
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

export function AdminShell({ children }: { children: ReactNode }) {
  const { data: me } = useApi<AdminMe>("/auth/me");
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = withBase("/admin/login");
  }

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--azure-soft),var(--lilac-soft))] ring-1 ring-border">
        <AuraHead size={30} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-bold text-fg">AAIW 2026</span>
        <span className="block text-xs font-semibold text-subtle">Content manager</span>
      </span>
    </Link>
  );

  const footer = (
    <div className="grid gap-2 border-t border-border pt-4">
      <a href={withBase("/")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg">
        <ExternalLink size={16} aria-hidden /> View website
      </a>
      <div className="flex items-center gap-2 px-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{me?.name || me?.email || "…"}</p>
          <p className="text-xs text-subtle capitalize">{me?.role ?? ""}</p>
        </div>
        <ThemeToggle />
        <button type="button" onClick={logout} className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted hover:border-blush-ink hover:text-blush-ink" aria-label="Sign out" title="Sign out">
          <LogOut size={17} aria-hidden />
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
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface" aria-label="Open admin menu" aria-expanded={open}>
            <Menu size={20} aria-hidden />
          </button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" className="absolute inset-0 bg-[rgb(10_15_30/0.45)]" onClick={() => setOpen(false)} aria-label="Close menu" />
            <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] animate-fade-up flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-card-lg">
              <div className="flex items-center justify-between">
                {brand}
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-border" aria-label="Close menu">
                  <X size={18} aria-hidden />
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
          {children}
        </main>
      </div>
    </MeContext.Provider>
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

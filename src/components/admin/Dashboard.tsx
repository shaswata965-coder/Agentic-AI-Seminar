"use client";

import { ArrowRight, CalendarDays, Download, FlaskConical, Inbox, ListChecks, Mail, Megaphone, Mic, RefreshCw, Settings, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { ATTENDEE_CATEGORY_META } from "@/lib/content/constants";
import { formatDateTime } from "@/lib/format";
import { withBase } from "@/lib/paths";
import { COLLECTIONS } from "@/lib/schema/resources";
import { PageTitle, useEventName, useMe, type AdminMe } from "./AdminShell";
import { api, useApi } from "./api";
import { VolunteerHome } from "./VolunteerHome";

interface Stats {
  workshop: number;
  workshopWeek: number;
  teams: number;
  enquiriesNew: number;
  enquiriesTotal: number;
  byCategory: { category: string; count: number }[];
  recentRegs: { id: string; regId: string; name: string; organisation: string; category: string; createdAt: string }[];
  recentEnquiries: { id: string; type: string; name: string; organisation: string; status: string; createdAt: string }[];
  counts: Record<string, number>;
  mail: boolean;
  demoItems: number;
  /** Volunteers' changes not reviewed yet (administrators only). */
  toReview: number;
}

export function Dashboard() {
  const me = useMe();
  const stats = useApi<Stats>(me && me.role !== "volunteer" ? "/stats" : null);
  if (!me) return <PageTitle title="Welcome!" />;
  if (me.role === "volunteer") return <VolunteerHome me={me} />;
  return <StaffDashboard me={me} data={stats.data} error={stats.error} />;
}

function StaffDashboard({ me, data, error }: { me: AdminMe; data: Stats | null; error: string | null }) {
  const eventName = useEventName();
  const tiles = [
    { label: "Workshop registrations", value: data?.workshop, note: data ? `+${data.workshopWeek} this week` : "", Icon: Ticket, tone: "tone-peach", href: "/admin/registrations" },
    { label: "Hackathon teams", value: data?.teams, note: "", Icon: Trophy, tone: "tone-aqua", href: "/admin/registrations?type=hackathon" },
    { label: "New enquiries", value: data?.enquiriesNew, note: data ? `${data.enquiriesTotal} in total` : "", Icon: Inbox, tone: "tone-blush", href: "/admin/enquiries" },
    { label: "Speakers", value: data?.counts?.speakers, note: "", Icon: Mic, tone: "tone-lilac", href: "/admin/content/speakers" },
  ];
  const max = Math.max(1, ...(data?.byCategory.map((c) => c.count) ?? [1]));
  const quick = [
    { href: "/admin/content/announcements", label: "Post an announcement", Icon: Megaphone },
    { href: "/admin/content/sessions", label: "Edit the programme", Icon: CalendarDays },
    { href: "/admin/content/speakers", label: "Add a speaker", Icon: Mic },
    { href: "/admin/settings", label: "Registration & dates", Icon: Settings },
  ];

  return (
    <div>
      <PageTitle title={`Welcome${me.name ? `, ${me.name.split(" ")[0]}` : ""}!`} description={`Here's what's happening with the ${eventName}.`} />
      {error ? <p className="card mb-6 p-4 text-blush-ink">{error}</p> : null}
      {data?.toReview ? (
        <Link href="/admin/tracker" className="tone-lilac card mb-6 flex items-center gap-3 p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-card-lg">
          <ListChecks size={18} aria-hidden className="shrink-0 text-lilac-ink" />
          <span className="flex-1 text-fg">
            <strong>
              Volunteers made {data.toReview} {data.toReview === 1 ? "change" : "changes"} waiting for your review.
            </strong>{" "}
            See who changed what in the task tracker.
          </span>
          <ArrowRight size={16} aria-hidden className="shrink-0 text-lilac-ink" />
        </Link>
      ) : null}
      {data?.demoItems ? (
        <div role="alert" className="tone-blush card mb-6 flex items-start gap-3 p-4 text-sm">
          <FlaskConical size={18} aria-hidden className="mt-0.5 shrink-0 text-blush-ink" />
          <p className="text-fg">
            <strong>Sample content is loaded ({data.demoItems} items).</strong> It was added to preview the design and is marked “sample”. Remove it before launch with{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[13px]">npm run seed:demo -- --remove</code> (your own content is kept), or delete the items here.
          </p>
        </div>
      ) : null}
      {data && !data.mail ? (
        <div className="tone-butter card mb-6 flex items-start gap-3 p-4 text-sm">
          <Mail size={18} aria-hidden className="mt-0.5 shrink-0 text-butter-ink" />
          <p className="text-fg">
            <strong>E-mail is not configured.</strong> Registrations and enquiries are saved, but confirmation e-mails are not sent. Ask your developer to set the SMTP settings (see README).
          </p>
        </div>
      ) : null}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ label, value, note, Icon, tone, href }) => (
          <li key={label}>
            <Link href={href} data-glow="" className={`${tone} card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card-lg`}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">
                <Icon size={22} aria-hidden />
              </span>
              <span>
                <span className="block font-display text-3xl font-bold text-fg tabular">{value ?? "–"}</span>
                <span className="block text-sm text-muted">{label}</span>
                {note ? <span className="block text-xs font-semibold text-accent-ink">{note}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid content-start gap-6">
          <section className="card p-6" aria-labelledby="recent-regs">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-regs" className="font-display text-xl font-bold text-fg">
                Latest registrations
              </h2>
              <a href={withBase("/api/admin/export/workshop")} className="mi-link inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                <Download size={15} aria-hidden /> CSV
              </a>
            </div>
            {data?.recentRegs.length ? (
              <ul className="mt-4 divide-y divide-border">
                {data.recentRegs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-fg">{r.name}</span>
                      <span className="block truncate text-muted">
                        {r.organisation} · {ATTENDEE_CATEGORY_META[r.category as keyof typeof ATTENDEE_CATEGORY_META] ?? r.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-subtle">
                      <span className="block font-semibold text-fg tabular">{r.regId}</span>
                      {formatDateTime(r.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">No registrations yet.</p>
            )}
            <Link href="/admin/registrations" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              All registrations <ArrowRight size={15} aria-hidden />
            </Link>
          </section>
          {data?.recentEnquiries.length ? (
            <section className="card p-6" aria-labelledby="recent-enq">
              <h2 id="recent-enq" className="font-display text-xl font-bold text-fg">
                Latest enquiries
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {data.recentEnquiries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-fg">{e.name}</span>
                      <span className="block truncate text-muted">{e.organisation || "-"}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone={e.type === "sponsor" ? "butter" : e.type === "exhibitor" ? "peach" : "azure"} size="xs">
                        {e.type}
                      </Badge>
                      {e.status === "new" ? (
                        <Badge tone="blush" size="xs" dot>
                          new
                        </Badge>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="grid content-start gap-6">
          <section className="card p-6" aria-labelledby="quick">
            <div className="flex items-center gap-3">
              <Aura variant="admin" size={64} lite />
              <h2 id="quick" className="font-display text-xl font-bold text-fg">
                Quick actions
              </h2>
            </div>
            <ul className="mt-4 grid gap-2">
              {quick.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link href={href} data-ripple="" className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-fg hover:translate-x-0.5 hover:border-brand hover:text-brand">
                    <span className="btn-ico-l">
                      <Icon size={17} aria-hidden />
                    </span>{" "}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <RefreshSite />
          </section>
          <section className="card p-6" aria-labelledby="by-cat">
            <h2 id="by-cat" className="font-display text-xl font-bold text-fg">
              Who&apos;s registering
            </h2>
            {data?.byCategory.length ? (
              <ul className="mt-4 grid gap-3">
                {data.byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="flex justify-between text-sm">
                      <span className="text-fg">{ATTENDEE_CATEGORY_META[c.category as keyof typeof ATTENDEE_CATEGORY_META] ?? c.category}</span>
                      <span className="font-semibold text-fg tabular">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--azure),var(--lilac))]" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">Nothing yet.</p>
            )}
          </section>
          <section className="card p-6" aria-labelledby="content-counts">
            <h2 id="content-counts" className="font-display text-xl font-bold text-fg">
              Content
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {COLLECTIONS.map((c) => (
                <li key={c.key}>
                  <Link href={`/admin/content/${c.key}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                    <span className="min-w-0 leading-snug text-muted">{c.label}</span>
                    <Badge tone="neutral" size="xs">
                      {data?.counts?.[c.key] ?? "–"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

    </div>
  );
}


/** Expire every cached page so the site shows exactly what is in the database. */
function RefreshSite() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setBusy(true);
    try {
      await api("/revalidate", { method: "POST" });
      toast("Website refreshed. Visitors now see the latest content.", "success");
    } catch (err) {
      toast((err as Error).message || "Could not refresh the website", "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        type="button"
        onClick={refresh}
        disabled={busy}
        data-ripple=""
        className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-border-strong px-3 py-2.5 text-sm font-semibold text-fg hover:border-brand hover:text-brand disabled:opacity-60"
      >
        <RefreshCw size={17} aria-hidden className={busy ? "animate-spin" : "transition-transform duration-500 group-hover:rotate-180"} /> {busy ? "Refreshing…" : "Refresh website"}
      </button>
      <p className="mt-2 text-xs text-subtle">Only needed after a new deployment or changes made outside this panel. Saving here updates the site automatically.</p>
    </div>
  );
}

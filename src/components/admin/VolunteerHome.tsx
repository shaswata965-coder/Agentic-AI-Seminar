"use client";

import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import type { ActivityPage } from "@/lib/activity";
import { areasOf } from "@/lib/permissions";
import { ActivityItem } from "./ActivityList";
import { PageTitle, type AdminMe } from "./AdminShell";
import { useApi } from "./api";

/** The dashboard for volunteers: their responsibility, the areas they can work on and their recent changes. */
export function VolunteerHome({ me }: { me: AdminMe }) {
  const { data, error } = useApi<ActivityPage>("/activity");
  const areas = areasOf(me.permissions);
  const canDelete = me.permissions.includes("delete");

  return (
    <div>
      <PageTitle title={`Welcome${me.name ? `, ${me.name.split(" ")[0]}` : ""}!`} description="Thank you for volunteering. Here's what you're looking after." />
      <div className="grid items-start gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid content-start gap-6">
          <section className="tone-azure card p-6" aria-labelledby="responsibility">
            <h2 id="responsibility" className="font-display text-xl font-bold text-fg">
              Your responsibility
            </h2>
            <p className="mt-2 text-[15px] whitespace-pre-wrap text-fg">{me.responsibility || "Not set yet. Ask an administrator what you'll be helping with."}</p>
          </section>

          <section className="card" aria-labelledby="my-changes">
            <h2 id="my-changes" className="px-6 pt-6 font-display text-xl font-bold text-fg">
              Your recent changes
            </h2>
            {error ? <p className="px-6 pt-3 pb-6 text-sm text-blush-ink">{error}</p> : null}
            {data && !data.items.length ? <p className="px-6 pt-3 pb-6 text-sm text-muted">Nothing yet. Changes you make will appear here.</p> : null}
            {data?.items.length ? (
              <ul className="mt-2 divide-y divide-border">
                {data.items.slice(0, 15).map((e) => (
                  <ActivityItem key={e.id} e={e} you />
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="card p-6" aria-labelledby="areas">
            <div className="flex items-center gap-3">
              <Aura variant="admin" size={64} lite />
              <h2 id="areas" className="font-display text-xl font-bold text-fg">
                What you can work on
              </h2>
            </div>
            {areas.length ? (
              <ul className="mt-4 grid gap-2">
                {areas.map((a) => (
                  <li key={a.key}>
                    <Link href={a.href} data-ripple="" className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-fg hover:translate-x-0.5 hover:border-brand hover:text-brand">
                      {a.label} <ArrowRight size={15} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">You don&apos;t have access to any area yet. Ask an administrator to add the ones you need.</p>
            )}
            {areas.length ? <p className="mt-3 text-xs text-subtle">{canDelete ? "You can also delete items in these areas." : "You can add, edit, hide and reorder items, but not delete them."}</p> : null}
          </section>

          <section className="tone-butter card flex items-start gap-3 p-5 text-sm" aria-label="About your changes">
            <Eye size={18} aria-hidden className="mt-0.5 shrink-0 text-butter-ink" />
            <p className="text-fg">Every change you make here is recorded with your name and shown to the administrators in their task tracker.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

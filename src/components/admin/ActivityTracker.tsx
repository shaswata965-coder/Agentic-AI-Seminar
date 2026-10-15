"use client";

import { CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { Button } from "@/components/ui/Button";
import { SlidingPill, useSlidingPill } from "@/components/ui/SlidingPill";
import { useToast } from "@/components/ui/Toast";
import { useUrlParam } from "@/lib/client-hooks";
import { cn } from "@/lib/cn";
import type { ActivityEntry, ActivityPage } from "@/lib/activity";
import { ACTIVITY_AREAS } from "@/lib/permissions";
import { ActivityItem } from "./ActivityList";
import { PageTitle, useMe } from "./AdminShell";
import { api, useApi } from "./api";

const selectClass = "h-11 rounded-full border border-border bg-surface px-4 text-sm font-semibold";

/** Everything volunteers changed, newest first, for administrators to review. */
export function ActivityTracker() {
  const me = useMe();
  const toast = useToast();
  const urlVolunteer = useUrlParam("volunteer");
  const [volunteerChoice, setVolunteer] = useState<string | null>(null);
  const volunteer = volunteerChoice ?? urlVolunteer ?? "";
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<"open" | "all">("open");
  const { listRef, pillRef } = useSlidingPill(status);
  const query = new URLSearchParams({ status, ...(volunteer ? { volunteer } : {}), ...(area ? { area } : {}) }).toString();
  const { data, error, loading, setData, reload } = useApi<ActivityPage>(`/activity?${query}`);
  const { data: volunteers } = useApi<{ id: string; name: string; email: string }[]>("/volunteers");
  const [busy, setBusy] = useState(false);

  async function loadMore() {
    if (!data?.next) return;
    setBusy(true);
    try {
      const page = await api<ActivityPage>(`/activity?${query}&before=${data.next}`);
      setData((d) => (d ? { ...page, items: [...d.items, ...page.items] } : page));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not load more", "error");
    } finally {
      setBusy(false);
    }
  }

  async function review(e: ActivityEntry, reviewed: boolean) {
    try {
      await api("/activity", { method: "PATCH", json: { ids: [e.id], reviewed } });
      const by = reviewed ? me?.name || me?.email || "" : "";
      // Stays in the list (greyed out) so it can be undone; it drops out of "To review" on the next load.
      setData((d) => d && { ...d, open: d.open + (reviewed ? -1 : 1), items: d.items.map((x) => (x.id === e.id ? { ...x, reviewed, reviewedBy: by, reviewedAt: reviewed ? new Date().toISOString() : null } : x)) });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  async function reviewAll() {
    setBusy(true);
    try {
      const res = await api<{ updated: number }>("/activity", { method: "PATCH", json: { reviewed: true, ...(volunteer ? { volunteer } : {}), ...(area ? { area } : {}) } });
      toast(`${res.updated} ${res.updated === 1 ? "change" : "changes"} marked as reviewed`, "success");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle
        title="Task tracker"
        description={
          <>
            Everything volunteers do in this panel, newest first: who changed what, with the values before and after. Mark entries as reviewed once you have checked them. Volunteers and their permissions are managed under{" "}
            <Link href="/admin/volunteers" className="font-semibold text-brand underline">
              Volunteers
            </Link>
            .
          </>
        }
        actions={
          <Button onClick={reviewAll} disabled={busy || !data?.open} icon={<CheckCheck size={17} aria-hidden />}>
            Mark all as reviewed
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div ref={listRef} className="group/seg relative isolate inline-flex rounded-full border border-border bg-surface p-1 shadow-card" role="group" aria-label="Show">
          <SlidingPill pillRef={pillRef} className="bg-brand shadow-sm" />
          {(["open", "all"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)} data-ripple="" className={cn("rounded-full px-4 py-2 text-sm font-semibold", status === s ? "bg-brand text-brand-fg group-data-[pill=on]/seg:bg-transparent" : "text-muted hover:text-fg")}>
              {s === "open" ? "To review" : "All changes"}
            </button>
          ))}
        </div>
        <select value={volunteer} onChange={(e) => setVolunteer(e.target.value)} className={selectClass} aria-label="Filter by volunteer">
          <option value="">All volunteers</option>
          {(volunteers ?? []).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name || v.email}
            </option>
          ))}
        </select>
        <select value={area} onChange={(e) => setArea(e.target.value)} className={selectClass} aria-label="Filter by area">
          <option value="">All areas</option>
          {ACTIVITY_AREAS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
          <option value="account">Account</option>
        </select>
        <span className="text-sm text-subtle">{data ? `${data.open} to review` : ""}</span>
      </div>

      {loading ? <div className="card p-10 text-center text-muted">Loading…</div> : null}
      {error ? <div className="card p-6 text-blush-ink">{error}</div> : null}

      {data && !data.items.length ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <Aura variant="admin" size={130} />
          <p className="mt-3 font-display text-xl font-semibold text-fg">{status === "open" ? "All caught up" : "No changes yet"}</p>
          <p className="mt-1 max-w-md text-muted">{status === "open" ? "Nothing is waiting for review." : "Changes volunteers make will appear here as they make them."}</p>
        </div>
      ) : null}

      {data?.items.length ? (
        <ul className="card divide-y divide-border">
          {data.items.map((e) => (
            <ActivityItem key={e.id} e={e} onReview={review} />
          ))}
        </ul>
      ) : null}

      {data?.next ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={busy}>
            {busy ? "Loading…" : "Load older changes"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

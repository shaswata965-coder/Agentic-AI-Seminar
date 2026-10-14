"use client";

import { Check, ChevronDown, Undo2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { areaOf, type ActivityEntry } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";

/* Entries of the task tracker: who changed what, and the field-by-field details. */

function Sentence({ e, you }: { e: ActivityEntry; you: boolean }) {
  const { label, href } = areaOf(e.area);
  const area = href ? (
    <Link href={href} className="font-semibold text-fg underline decoration-border-strong underline-offset-2 hover:text-brand">
      {label}
    </Link>
  ) : (
    <strong className="font-semibold text-fg">{label}</strong>
  );
  // Settings pages are their own target ("edited Site settings").
  const target = e.target && e.target !== label ? <strong className="font-semibold text-fg">“{e.target}”</strong> : null;
  switch (e.action) {
    case "created":
      return <>added {target} to {area}</>;
    case "updated":
      return target ? <>edited {target} in {area}</> : <>edited {area}</>;
    case "deleted":
      return <>deleted {target} from {area}</>;
    case "reordered":
      return <>reordered {area}</>;
    case "uploaded":
      return <>uploaded {target} to {area}</>;
    case "downloaded":
      return <>downloaded {target}</>;
    case "changed-password":
      return <>changed {you ? "your" : "their"} password</>;
  }
}

function Value({ tone, label, children }: { tone: "before" | "after" | "plain"; label: string; children: string }) {
  return (
    <div className={cn("min-w-0 rounded-lg px-3 py-2", tone === "before" && "bg-blush-soft", tone === "after" && "bg-mint-soft", tone === "plain" && "bg-surface")}>
      <span className={cn("block text-[11px] font-bold tracking-[0.08em] uppercase", tone === "before" ? "text-blush-ink" : tone === "after" ? "text-mint-ink" : "text-subtle")}>{label}</span>
      <span className={cn("mt-0.5 block text-sm break-words whitespace-pre-wrap", children ? "text-fg" : "text-subtle italic")}>{children || "empty"}</span>
    </div>
  );
}

function Changes({ e }: { e: ActivityEntry }) {
  if (!e.changes.length) return null;
  const n = e.changes.length;
  const summary = e.action === "created" ? "What they entered" : e.action === "deleted" ? "What was deleted" : `${n} ${n === 1 ? "change" : "changes"}`;
  return (
    <details className="group/changes mt-2">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
        <ChevronDown size={15} aria-hidden className="transition-transform group-open/changes:rotate-180" /> {summary}
      </summary>
      <dl className="mt-2 grid gap-2">
        {e.changes.map((c, i) => (
          <div key={i} className="rounded-xl bg-surface-2 p-3">
            <dt className="text-sm font-semibold text-fg">{c.field}</dt>
            <dd className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
              {e.action === "created" ? (
                <Value tone="plain" label="Value">
                  {c.to}
                </Value>
              ) : e.action === "deleted" ? (
                <Value tone="plain" label="Value">
                  {c.from}
                </Value>
              ) : (
                <>
                  <Value tone="before" label="Before">
                    {c.from}
                  </Value>
                  <Value tone="after" label="After">
                    {c.to}
                  </Value>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/**
 * One entry. `you` phrases it for the volunteer who made it; `onReview`
 * (administrators) adds the reviewed toggle.
 */
export function ActivityItem({ e, you = false, onReview }: { e: ActivityEntry; you?: boolean; onReview?: (e: ActivityEntry, reviewed: boolean) => void }) {
  let action: ReactNode = null;
  if (onReview) {
    action = e.reviewed ? (
      <button type="button" onClick={() => onReview(e, false)} data-ripple="" className="group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-mint-ink hover:bg-surface-2" title={`Reviewed by ${e.reviewedBy || "an administrator"}. Click to undo.`}>
        <Check size={15} aria-hidden className="group-hover:hidden" />
        <Undo2 size={15} aria-hidden className="hidden group-hover:block" /> Reviewed
      </button>
    ) : (
      <button type="button" onClick={() => onReview(e, true)} data-ripple="" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-semibold text-fg hover:border-brand hover:text-brand">
        <Check size={15} aria-hidden /> Mark reviewed
      </button>
    );
  }
  return (
    <li className={cn("flex gap-3 p-4 sm:p-5", e.reviewed && onReview && "opacity-75")}>
      {you ? null : <Avatar name={e.actorName || e.actorEmail} size={40} className="shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 text-[15px] text-muted">
            <span className="font-semibold text-fg">{you ? "You" : e.actorName || e.actorEmail}</span> <Sentence e={e} you={you} />
          </p>
          {action}
        </div>
        <p className="mt-0.5 text-xs text-subtle">
          {formatDateTime(e.createdAt)} IST{you ? "" : ` · ${e.actorEmail}`}
          {e.reviewed && e.reviewedBy ? ` · reviewed by ${e.reviewedBy}` : ""}
        </p>
        <Changes e={e} />
      </div>
    </li>
  );
}

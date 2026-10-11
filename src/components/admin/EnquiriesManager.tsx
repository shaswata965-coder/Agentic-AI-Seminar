"use client";

import { Download, Mail, Trash } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { SlidingPill, useSlidingPill } from "@/components/ui/SlidingPill";
import { formatDateTime } from "@/lib/format";
import { withBase } from "@/lib/paths";
import { PageTitle, useMe } from "./AdminShell";
import { api, useApi } from "./api";

interface Enquiry {
  id: string;
  type: "contact" | "exhibitor" | "sponsor";
  name: string;
  email: string;
  organisation: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "closed";
  notes: string;
  createdAt: string;
}
const TYPE = { contact: { label: "Contact", tone: "azure" }, exhibitor: { label: "Exhibitor", tone: "peach" }, sponsor: { label: "Sponsor", tone: "butter" } } as const;
const STATUS = { new: "blush", "in-progress": "butter", closed: "mint" } as const;

export function EnquiriesManager() {
  const me = useMe();
  const toast = useToast();
  const { data, loading, setData, reload } = useApi<Enquiry[]>("/enquiries");
  const [type, setType] = useState<"all" | Enquiry["type"]>("all");
  const { listRef, pillRef } = useSlidingPill(type);
  const rows = (data ?? []).filter((e) => type === "all" || e.type === type);

  async function setStatus(e: Enquiry, status: Enquiry["status"]) {
    try {
      await api(`/enquiries/${e.id}`, { method: "PATCH", json: { status } });
      setData((list) => (list ?? []).map((x) => (x.id === e.id ? { ...x, status } : x)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }
  async function remove(e: Enquiry) {
    if (!window.confirm(`Delete the enquiry from ${e.name}?`)) return;
    await api(`/enquiries/${e.id}`, { method: "DELETE" }).then(reload, (err: Error) => toast(err.message, "error"));
  }

  return (
    <div>
      <PageTitle
        title="Enquiries"
        description="Messages from the contact form, “Exhibit with us” and “Become a partner”."
        actions={
          <a href={withBase("/api/admin/export/enquiries")} data-ripple="" className="btn-shine inline-flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-brand-fg hover:-translate-y-0.5 hover:bg-brand-strong">
            <Download size={16} aria-hidden /> Download CSV
          </a>
        }
      />
      <div ref={listRef} className="group/seg relative isolate mb-4 inline-flex flex-wrap rounded-full border border-border bg-surface p-1 shadow-card" role="group" aria-label="Filter by type">
        <SlidingPill pillRef={pillRef} className="bg-brand shadow-sm" />
        {(["all", "contact", "exhibitor", "sponsor"] as const).map((t) => (
          <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} data-ripple="" className={cn("rounded-full px-4 py-2 text-sm font-semibold capitalize", type === t ? "bg-brand text-brand-fg group-data-[pill=on]/seg:bg-transparent" : "text-muted hover:text-fg")}>
            {t}
          </button>
        ))}
      </div>
      {loading ? <div className="card p-10 text-center text-muted">Loading…</div> : null}
      {data && !rows.length ? <div className="card p-10 text-center text-muted">No enquiries here yet.</div> : null}
      <ul className="grid gap-3">
        {rows.map((e) => (
          <li key={e.id} className={cn("card p-5", e.status === "closed" && "opacity-75")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={TYPE[e.type].tone} size="xs">
                    {TYPE[e.type].label}
                  </Badge>
                  <Badge tone={STATUS[e.status]} size="xs" dot>
                    {e.status}
                  </Badge>
                  <span className="text-xs text-subtle">{formatDateTime(e.createdAt)}</span>
                </div>
                <p className="mt-2 font-display text-lg font-semibold text-fg">
                  {e.name}
                  {e.organisation ? <span className="font-sans text-sm font-medium text-muted"> · {e.organisation}</span> : null}
                </p>
                <p className="text-sm text-muted">
                  {e.email}
                  {e.phone ? ` · ${e.phone}` : ""}
                </p>
                {e.subject ? <p className="mt-2 text-sm font-semibold text-fg">{e.subject}</p> : null}
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted">{e.message}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject || "your enquiry"} — Agentic AI Workshop 2026`)}`} onClick={() => e.status === "new" && setStatus(e, "in-progress")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-semibold hover:border-brand hover:text-brand">
                  <Mail size={15} aria-hidden /> Reply
                </a>
                <select value={e.status} onChange={(ev) => setStatus(e, ev.target.value as Enquiry["status"])} className="h-9 rounded-full border border-border bg-surface px-3 text-sm font-semibold" aria-label="Status">
                  <option value="new">new</option>
                  <option value="in-progress">in progress</option>
                  <option value="closed">closed</option>
                </select>
                {me?.role === "admin" ? (
                  <Button variant="ghost" size="sm" className="text-blush-ink" onClick={() => remove(e)} aria-label={`Delete enquiry from ${e.name}`}>
                    <Trash size={15} aria-hidden />
                  </Button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

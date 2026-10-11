"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { inputClass } from "@/components/forms/fields";
import { cn } from "@/lib/cn";
import { COLLECTION_MAP } from "@/lib/schema/resources";
import { api } from "./api";

type Option = { value: string; label: string };
const cache = new Map<string, Promise<Option[]>>();

export function invalidateOptions(resource: string) {
  cache.delete(resource);
}

function loadOptions(resource: string): Promise<Option[]> {
  if (!cache.has(resource)) {
    const def = COLLECTION_MAP[resource];
    cache.set(
      resource,
      api<Record<string, unknown>[]>(`/content/${resource}`)
        .then((items) =>
          items.map((it) => ({
            value: String(it.id),
            label: [String(it[def?.titleKey ?? "name"] ?? it.id), it.affiliation ? `· ${String(it.affiliation)}` : ""].filter(Boolean).join(" "),
          })),
        )
        .catch((e) => {
          cache.delete(resource);
          throw e;
        }),
    );
  }
  return cache.get(resource)!;
}

function useOptions(resource: string) {
  const [options, setOptions] = useState<Option[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadOptions(resource)
      .then((o) => alive && setOptions(o))
      .catch(() => alive && setOptions([]));
    return () => {
      alive = false;
    };
  }, [resource]);
  return options;
}

export function RefSelect({ resource, value, onChange, id, invalid }: { resource: string; value: string; onChange: (v: string) => void; id?: string; invalid?: boolean }) {
  const options = useOptions(resource);
  return (
    <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid || undefined} className={cn(inputClass, "h-11")}>
      <option value="">{options === null ? "Loading…" : "— None —"}</option>
      {(options ?? []).map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Ordered multi-select of linked items (e.g. the speakers of a session). */
export function RefListSelect({ resource, value, onChange, id }: { resource: string; value: string[]; onChange: (v: string[]) => void; id?: string }) {
  const options = useOptions(resource);
  const label = (v: string) => options?.find((o) => o.value === v)?.label ?? "Unknown (deleted?)";
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const available = (options ?? []).filter((o) => !value.includes(o.value));
  return (
    <div className="grid gap-2">
      {value.length ? (
        <ul className="grid gap-1.5">
          {value.map((v, i) => (
            <li key={v} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 py-1.5 pr-1.5 pl-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium text-fg">{label(v)}</span>
              <button type="button" onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-lg text-subtle hover:bg-surface hover:text-fg" aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-lg text-subtle hover:bg-surface hover:text-fg" aria-label="Move down">
                <ArrowDown size={14} />
              </button>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="grid h-7 w-7 place-items-center rounded-lg text-subtle hover:bg-blush-soft hover:text-blush-ink" aria-label={`Remove ${label(v)}`}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <select
        id={id}
        value=""
        onChange={(e) => e.target.value && onChange([...value, e.target.value])}
        className={cn(inputClass, "h-11")}
        disabled={options !== null && !available.length}
      >
        <option value="">{options === null ? "Loading…" : available.length ? "+ Add…" : options.length ? "All added" : `No ${COLLECTION_MAP[resource]?.label.toLowerCase() ?? "items"} yet — create them first`}</option>
        {available.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

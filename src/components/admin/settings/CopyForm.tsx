"use client";

import { Check, Info, TriangleAlert } from "lucide-react";
import { FieldShell, inputClass } from "@/components/forms/fields";
import { cn } from "@/lib/cn";
import { fill, type Vars } from "@/lib/copy";
import { BACKGROUND_OPTIONS, LENGTHS, lengthIssue, lengthRange, PAGE_COPY, TONE_OPTIONS, type CopyField, type CopyKey } from "@/lib/schema/page-copy";

type Values = Record<string, string>;

/** Length issues of a section's texts as they will appear (placeholders filled in). */
export function copyIssues(key: CopyKey, value: Values | undefined, vars: Vars) {
  return Object.keys(PAGE_COPY[key])
    .map((name) => ({ name, issue: lengthIssue(key, name, fill(value?.[name] ?? "", vars)) }))
    .filter((x): x is { name: string; issue: NonNullable<typeof x.issue> } => x.issue !== null);
}

function Swatches({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {TONE_OPTIONS.map((t) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={value === t.value}
          title={t.label}
          onClick={() => onChange(t.value)}
          className={cn(
            `tone-${t.value}`,
            "grid h-9 w-9 place-items-center rounded-full border-2 bg-[var(--accent)] text-[var(--accent-ink)] transition-transform hover:scale-110",
            value === t.value ? "border-fg" : "border-transparent",
          )}
        >
          {value === t.value ? <Check size={16} strokeWidth={3} aria-hidden /> : null}
          <span className="sr-only">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The texts and colours of one section, with a length check on every text. */
export function CopyForm({ copyKey, value, onChange, errors, vars }: { copyKey: CopyKey; value: Values; onChange: (v: Values) => void; errors: Record<string, string>; vars: Vars }) {
  const set = (name: string, v: string) => onChange({ ...value, [name]: v });
  return (
    <div className="grid grid-cols-6 gap-x-4 gap-y-5">
      {Object.entries(PAGE_COPY[copyKey] as Record<string, CopyField>).map(([name, f]) => {
        const v = value[name] ?? "";
        const error = errors[name];
        if (f.kind === "tone") {
          return (
            <div key={name} className="col-span-6 grid gap-1.5 sm:col-span-3">
              <span className="text-sm font-semibold text-fg">{f.label}</span>
              <Swatches value={v} onChange={(t) => set(name, t)} label={f.label} />
            </div>
          );
        }
        if (f.kind === "background") {
          return (
            <div key={name} className="col-span-6 grid gap-1.5 sm:col-span-3">
              <span className="text-sm font-semibold text-fg">{f.label}</span>
              <div role="radiogroup" aria-label={f.label} className="inline-flex w-fit rounded-xl border border-border bg-surface p-1">
                {BACKGROUND_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={v === o.value}
                    onClick={() => set(name, o.value)}
                    className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", v === o.value ? "bg-brand text-brand-fg" : "text-muted hover:text-fg")}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        const shown = fill(v, vars);
        const issue = lengthIssue(copyKey, name, shown);
        const warn = issue?.level === "warn";
        const cap = LENGTHS[f.kind].cap;
        const range = lengthRange(copyKey, name);
        const multiline = f.kind === "text" || f.kind === "long";
        const required = f.kind === "title" && name === "title";
        const hint = (
          <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <span className={cn("flex items-start gap-1", issue?.level === "warn" ? "font-medium text-butter-ink" : "")}>
              {issue ? (
                <>
                  {issue.level === "warn" ? <TriangleAlert size={13} aria-hidden className="mt-0.5 shrink-0" /> : <Info size={13} aria-hidden className="mt-0.5 shrink-0" />}
                  {issue.message}
                </>
              ) : (
                f.help ?? ""
              )}
            </span>
            {range ? (
              <span className={cn("ml-auto shrink-0 tabular", issue?.level === "warn" ? "font-semibold text-butter-ink" : "text-subtle")} data-counter={name}>
                {shown.trim().length}/{range.max}
              </span>
            ) : null}
          </span>
        );
        return (
          <FieldShell key={name} label={f.label} required={required} hint={hint} error={error} className={cn("col-span-6", !multiline && f.kind !== "title" && "sm:col-span-3")}>
            {({ id, describedBy, invalid }) =>
              multiline ? (
                <textarea
                  id={id}
                  name={`${copyKey}.${name}`}
                  rows={f.kind === "long" ? 5 : 2}
                  value={v}
                  aria-invalid={invalid || undefined}
                  maxLength={cap}
                  aria-describedby={describedBy}
                  onChange={(e) => set(name, e.target.value)}
                  className={cn(inputClass, "resize-y py-2.5", warn && "border-butter-ink")}
                />
              ) : (
                <input
                  id={id}
                  name={`${copyKey}.${name}`}
                  value={v}
                  aria-invalid={invalid || undefined}
                  maxLength={cap}
                  aria-describedby={describedBy}
                  onChange={(e) => set(name, e.target.value)}
                  className={cn(inputClass, "h-11", warn && "border-butter-ink")}
                />
              )
            }
          </FieldShell>
        );
      })}
    </div>
  );
}

"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, Plus, Trash, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { inputClass } from "@/components/forms/fields";
import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/cn";
import { emptyValue } from "@/lib/content/normalize";
import { isoToLocalInput, localInputToIso } from "@/lib/format";
import type { FieldDef } from "@/lib/schema/fields";
import { MediaPicker } from "./MediaPicker";
import { OrderInput } from "./OrderInput";
import { RefListSelect, RefSelect } from "./RefSelect";

type Values = Record<string, unknown>;
type Errors = Record<string, string>;

const span = (f: FieldDef) => (f.width === "half" ? "col-span-6 sm:col-span-3" : f.width === "third" ? "col-span-6 sm:col-span-2" : "col-span-6");

/** Renders a set of field definitions as a form (recursively for lists and groups). */
export function RecordForm({ fields, value, onChange, errors = {}, path = "" }: { fields: FieldDef[]; value: Values; onChange: (v: Values) => void; errors?: Errors; path?: string }) {
  return (
    <div className="grid grid-cols-6 gap-x-4 gap-y-5">
      {fields.map((f) => (
        <div key={f.name} className={span(f)}>
          <FieldInput field={f} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} errors={errors} path={path ? `${path}.${f.name}` : f.name} />
        </div>
      ))}
    </div>
  );
}

function Label({ htmlFor, field, extra }: { htmlFor: string; field: FieldDef; extra?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-fg">
        {field.label}
        {field.required ? <span className="ml-0.5 text-blush-ink">*</span> : null}
      </label>
      {extra}
    </div>
  );
}

function FieldInput({ field: f, value, onChange, errors, path }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; errors: Errors; path: string }) {
  const id = useId();
  const error = errors[path];
  const [preview, setPreview] = useState(false);
  const help = f.help ? <p className="mt-1.5 text-xs text-subtle">{f.help}</p> : null;
  const err = error ? <p className="mt-1.5 text-sm font-medium text-blush-ink">{error}</p> : null;
  const common = { id, "aria-invalid": error ? true : undefined } as const;
  const str = typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);

  switch (f.type) {
    case "boolean":
      return (
        <div>
          <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-border-strong has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
            <input {...common} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
            <span aria-hidden className="relative h-6 w-11 shrink-0 rounded-full bg-border-strong transition peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-[color-mix(in_oklab,var(--brand)_25%,transparent)] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-[translate] after:duration-300 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:after:translate-x-5" />
            <span className="text-sm font-semibold text-fg">{f.label}</span>
          </label>
          {help}
          {err}
        </div>
      );
    case "textarea":
    case "richtext":
      return (
        <div>
          <Label
            htmlFor={id}
            field={f}
            extra={
              f.type === "richtext" ? (
                <button type="button" onClick={() => setPreview((p) => !p)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                  <Eye size={13} aria-hidden /> {preview ? "Edit" : "Preview"}
                </button>
              ) : null
            }
          />
          {preview ? (
            <div className="min-h-24 rounded-2xl border border-border bg-surface-2 p-4 text-[15px] text-muted">
              {str ? <RichText text={str} /> : <span className="text-subtle">Nothing to preview.</span>}
            </div>
          ) : (
            <textarea {...common} rows={f.rows ?? 4} value={str} maxLength={f.maxLength} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "resize-y py-3")} />
          )}
          {help}
          {err}
        </div>
      );
    case "number":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <input {...common} type="number" value={value === null || value === undefined ? "" : String(value)} min={f.min} max={f.max} step={f.step} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className={cn(inputClass, "h-11")} />
          {help}
          {err}
        </div>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <select {...common} value={str} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-11")}>
            {!f.required ? <option value="">None</option> : null}
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {help}
          {err}
        </div>
      );
    case "multiselect": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-fg">{f.label}</legend>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => (
              <label key={o.value} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="checkbox" checked={list.includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...list, o.value] : list.filter((x) => x !== o.value))} className="accent-[var(--brand)]" />
                {o.label}
              </label>
            ))}
          </div>
          {help}
          {err}
        </fieldset>
      );
    }
    case "date":
    case "time":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <input {...common} type={f.type} value={str} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-11")} />
          {help}
          {err}
        </div>
      );
    case "datetime":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <input {...common} type="datetime-local" value={isoToLocalInput(str)} onChange={(e) => onChange(localInputToIso(e.target.value))} className={cn(inputClass, "h-11")} />
          {help}
          {err}
        </div>
      );
    case "color":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <div className="flex items-center gap-2">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(str) ? str : "#3b5bdb"} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-surface p-1" aria-label={`${f.label} picker`} />
            <input {...common} value={str} placeholder="#3b5bdb" onChange={(e) => onChange(e.target.value.trim())} className={cn(inputClass, "h-11")} />
            {str ? (
              <button type="button" onClick={() => onChange("")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border text-subtle hover:text-fg" aria-label="Clear colour">
                <X size={16} />
              </button>
            ) : null}
          </div>
          {help}
          {err}
        </div>
      );
    case "image":
    case "file":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <MediaPicker id={id} value={str} onChange={onChange} accept={f.accept} invalid={Boolean(error)} />
          {help}
          {err}
        </div>
      );
    case "ref":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <RefSelect id={id} resource={f.resource} value={str} onChange={onChange} invalid={Boolean(error)} />
          {help}
          {err}
        </div>
      );
    case "refList":
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <RefListSelect id={id} resource={f.resource} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
          {help}
          {err}
        </div>
      );
    case "stringList": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      const set = (i: number, v: string) => onChange(list.map((x, j) => (j === i ? v : x)));
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-fg">{f.label}</legend>
          <ul className="grid gap-2">
            {list.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => set(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onChange([...list.slice(0, i + 1), "", ...list.slice(i + 1)]);
                    }
                  }}
                  aria-label={`${f.itemLabel ?? "Item"} ${i + 1}`}
                  className={cn(inputClass, "h-10")}
                />
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-subtle hover:bg-blush-soft hover:text-blush-ink" aria-label={`Remove ${f.itemLabel ?? "item"} ${i + 1}`}>
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          {!f.maxItems || list.length < f.maxItems ? (
            <button type="button" onClick={() => onChange([...list, ""])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              <Plus size={15} aria-hidden /> Add {(f.itemLabel ?? "item").toLowerCase()}
            </button>
          ) : null}
          {help}
          {err}
        </fieldset>
      );
    }
    case "order":
      return <OrderInput field={f} value={value} onChange={onChange} error={error} />;
    case "objectList":
      return <ObjectListInput field={f} value={Array.isArray(value) ? (value as Values[]) : []} onChange={onChange} errors={errors} path={path} help={help} err={err} />;
    case "group":
      return (
        <fieldset className="rounded-2xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-fg">{f.label}</legend>
          <RecordForm fields={f.fields} value={(value as Values) ?? {}} onChange={onChange} errors={errors} path={path} />
        </fieldset>
      );
    default:
      return (
        <div>
          <Label htmlFor={id} field={f} />
          <input {...common} type={f.type === "email" ? "email" : f.type === "url" ? "url" : f.type === "tel" ? "tel" : "text"} value={str} maxLength={"maxLength" in f ? f.maxLength : undefined} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-11")} />
          {help}
          {err}
        </div>
      );
  }
}

function ObjectListInput({
  field: f,
  value: list,
  onChange,
  errors,
  path,
  help,
  err,
}: {
  field: Extract<FieldDef, { type: "objectList" }>;
  value: Values[];
  onChange: (v: unknown) => void;
  errors: Errors;
  path: string;
  help: ReactNode;
  err: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(list.length === 1 ? 0 : null);
  const blank = () => Object.fromEntries(f.fields.map((x) => [x.name, x.type === "select" && x.required ? x.options[0]?.value ?? "" : emptyValue(x)]));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  const hasError = (i: number) => Object.keys(errors).some((k) => k.startsWith(`${path}.${i}.`));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-fg">
        {f.label} <span className="font-normal text-subtle">({list.length})</span>
      </legend>
      <ul className="grid gap-2">
        {list.map((item, i) => {
          const title = String(item?.[f.titleKey ?? f.fields[0]?.name] ?? "").trim() || `${f.itemLabel} ${i + 1}`;
          const isOpen = open === i;
          return (
            <li key={i} className={cn("rounded-2xl border bg-surface", hasError(i) ? "border-blush-ink" : "border-border")}>
              <div className="flex items-center gap-1 p-1.5 pl-3">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm font-semibold text-fg" aria-expanded={isOpen}>
                  <ChevronDown size={16} aria-hidden className={cn("shrink-0 text-subtle transition-transform", isOpen && "rotate-180")} />
                  <span className="truncate">{title}</span>
                </button>
                <button type="button" onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg" aria-label={`Move ${title} up`}>
                  <ArrowUp size={15} />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg" aria-label={`Move ${title} down`}>
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(list.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-blush-soft hover:text-blush-ink"
                  aria-label={`Remove ${title}`}
                >
                  <Trash size={15} />
                </button>
              </div>
              {isOpen ? (
                <div className="border-t border-border p-4">
                  <RecordForm fields={f.fields} value={item} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} errors={errors} path={`${path}.${i}`} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {!f.maxItems || list.length < f.maxItems ? (
        <button
          type="button"
          onClick={() => {
            onChange([...list, blank()]);
            setOpen(list.length);
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3.5 py-1.5 text-sm font-semibold text-brand hover:border-brand"
        >
          <Plus size={15} aria-hidden /> Add {f.itemLabel.toLowerCase()}
        </button>
      ) : null}
      {help}
      {err}
    </fieldset>
  );
}

"use client";

import { ArrowDown, ArrowUp, ChevronDown, EyeOff, Lock, Plus, Trash, X } from "lucide-react";
import { useId, useState } from "react";
import { inputClass } from "@/components/forms/fields";
import { cn } from "@/lib/cn";
import { ANSWER_TYPE_LABELS, FORMS, formFields, hasChoices, kindOf, limitsOf, newFieldKey, type AnswerType, type FormField } from "@/lib/forms";
import type { FormFieldsField } from "@/lib/schema/fields";

/**
 * A public form's fields, for Site settings: each one's name, guide (help and example), type of answer, choices,
 * whether it is required or shown, and its step; questions can be added, moved and deleted. Built-in fields can't
 * be deleted, and those the site needs keep their type or stay required (a padlock says why).
 */
export function FormFieldsInput({ field: f, value, onChange, error }: { field: FormFieldsField; value: unknown; onChange: (v: FormField[]) => void; error?: string }) {
  // As typed (tidied when saved), or made whole if it isn't a list yet.
  const list = Array.isArray(value) ? (value as FormField[]) : formFields(f.form, value);
  const spec = FORMS[f.form];
  const [open, setOpen] = useState<string | null>(null);
  const set = (key: string, patch: Partial<FormField>) => onChange(list.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const key = newFieldKey();
    onChange([...list, { key, label: "New question", help: "", placeholder: "", type: "text", options: [], required: false, leadOnly: false, hidden: false, step: spec.steps.length }]);
    setOpen(key);
  };

  return (
    // min-w-0: a fieldset is at least as wide as its content by default, which would push it under the preview.
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-semibold text-fg">
        {f.label} <span className="font-normal text-subtle">({list.filter((x) => !x.hidden).length} shown)</span>
      </legend>
      {f.help ? <p className="mb-2 text-xs text-subtle">{f.help}</p> : null}
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {list.map((x, i) => {
          const limits = limitsOf(f.form, x.key);
          const isOpen = open === x.key;
          return (
            <li key={x.key} className={cn("rounded-2xl border bg-surface", x.hidden ? "border-dashed border-border-strong" : "border-border")} data-form-field={x.key}>
              <div className="flex items-center gap-1 p-1.5 pl-3">
                <button type="button" onClick={() => setOpen(isOpen ? null : x.key)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm" aria-expanded={isOpen}>
                  <ChevronDown size={16} aria-hidden className={cn("shrink-0 text-subtle transition-transform", isOpen && "rotate-180")} />
                  <span className={cn("truncate font-semibold", x.hidden ? "text-subtle" : "text-fg")}>{x.label}</span>
                  {x.required ? <span className="shrink-0 text-blush-ink" aria-label="required">*</span> : null}
                  <span className="hidden shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-muted sm:inline">{ANSWER_TYPE_LABELS[x.type]}</span>
                  {spec.steps.length > 1 ? <span className="hidden shrink-0 text-[11px] text-subtle md:inline">step {x.step}</span> : null}
                  {x.hidden ? <EyeOff size={14} aria-label="hidden" className="shrink-0 text-subtle" /> : null}
                  {!limits.builtIn ? <span className="shrink-0 rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">Your question</span> : null}
                </button>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg disabled:opacity-30" aria-label={`Move ${x.label} up`}>
                  <ArrowUp size={15} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg disabled:opacity-30" aria-label={`Move ${x.label} down`}>
                  <ArrowDown size={15} />
                </button>
                {limits.builtIn ? (
                  <span className="grid h-8 w-8 place-items-center text-subtle" title="Built-in field: it can be hidden but not deleted">
                    <Lock size={14} aria-label="built-in" />
                  </span>
                ) : (
                  <button type="button" onClick={() => onChange(list.filter((y) => y.key !== x.key))} className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-blush-soft hover:text-blush-ink" aria-label={`Delete ${x.label}`}>
                    <Trash size={15} />
                  </button>
                )}
              </div>
              {isOpen ? <FieldEditor form={f.form} field={x} steps={spec.steps} members={Boolean(spec.members)} onChange={(patch) => set(x.key, patch)} /> : null}
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={add} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3.5 py-1.5 text-sm font-semibold text-brand hover:border-brand">
        <Plus size={15} aria-hidden /> Add a question
      </button>
      {error ? <p className="mt-1.5 text-sm font-medium text-blush-ink">{error}</p> : null}
    </fieldset>
  );
}

function FieldEditor({ form, field: x, steps, members, onChange }: { form: FormFieldsField["form"]; field: FormField; steps: string[]; members: boolean; onChange: (patch: Partial<FormField>) => void }) {
  const id = useId();
  const limits = limitsOf(form, x.key);
  const label = "mb-1.5 block text-sm font-semibold text-fg";
  const changeType = (type: AnswerType) => onChange({ type, options: hasChoices(type) ? (x.options.length ? x.options : ["Option 1", "Option 2"]) : [] });
  return (
    // Columns that may shrink: a drop-down list is otherwise as wide as its longest choice.
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 border-t border-border p-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-label`} className={label}>
          Field name
        </label>
        <input id={`${id}-label`} value={x.label} maxLength={300} onChange={(e) => onChange({ label: e.target.value })} className={cn(inputClass, "h-11")} />
      </div>
      <div>
        <label htmlFor={`${id}-type`} className={label}>
          Type of answer
        </label>
        <select id={`${id}-type`} value={x.type} onChange={(e) => changeType(e.target.value as AnswerType)} disabled={limits.types.length < 2} className={cn(inputClass, "h-11 disabled:opacity-100")}>
          {limits.types.map((t) => (
            <option key={t} value={t}>
              {ANSWER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        {limits.builtIn && limits.types.length > 1 && limits.types.length < 9 ? <p className="mt-1.5 text-xs text-subtle">Built-in: it keeps answers of the same kind ({kindOf(x.type) === "text" ? "text" : kindOf(x.type) === "list" ? "a list of choices" : "yes or no"}).</p> : null}
      </div>
      {steps.length > 1 ? (
        <div>
          <label htmlFor={`${id}-step`} className={label}>
            Step
          </label>
          <select id={`${id}-step`} value={x.step} onChange={(e) => onChange({ step: Number(e.target.value) })} className={cn(inputClass, "h-11")}>
            {steps.map((s, i) => (
              <option key={s} value={i + 1}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-help`} className={label}>
          Guide <span className="font-normal text-subtle">(shown under the field)</span>
        </label>
        <input id={`${id}-help`} value={x.help} maxLength={500} onChange={(e) => onChange({ help: e.target.value })} className={cn(inputClass, "h-11")} />
      </div>
      {x.type !== "checkbox" && x.type !== "checkboxes" && x.type !== "radio" ? (
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-ph`} className={label}>
            {x.type === "select" ? "First line of the list" : "Example inside the field"} <span className="font-normal text-subtle">(optional)</span>
          </label>
          <input id={`${id}-ph`} value={x.placeholder} maxLength={200} onChange={(e) => onChange({ placeholder: e.target.value })} placeholder={x.type === "select" ? "Choose one" : ""} className={cn(inputClass, "h-11")} />
        </div>
      ) : null}
      {hasChoices(x.type) ? <Choices id={id} options={x.options} onChange={(options) => onChange({ options })} /> : null}
      <div className="grid gap-2 sm:col-span-2">
        <Toggle label="Required" checked={x.required} disabled={limits.always || x.hidden} onChange={(required) => onChange({ required, leadOnly: required && x.leadOnly })} />
        {members && x.required && !limits.always ? <Toggle label="Required for the team lead only" checked={x.leadOnly} onChange={(leadOnly) => onChange({ leadOnly })} /> : null}
        <Toggle label="Show this field" checked={!x.hidden} disabled={limits.always} onChange={(shown) => onChange({ hidden: !shown, required: shown && x.required })} />
        {limits.always && limits.why ? (
          <p className="flex items-start gap-1.5 text-xs text-subtle">
            <Lock size={13} aria-hidden className="mt-0.5 shrink-0" /> Always shown and required: {limits.why}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Choices({ id, options, onChange }: { id: string; options: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset className="min-w-0 sm:col-span-2">
      <legend className="mb-1.5 text-sm font-semibold text-fg">Choices</legend>
      <ul className="grid gap-2">
        {options.map((o, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              id={`${id}-o${i}`}
              value={o}
              maxLength={200}
              aria-label={`Choice ${i + 1}`}
              onChange={(e) => onChange(options.map((y, j) => (j === i ? e.target.value : y)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onChange([...options.slice(0, i + 1), "", ...options.slice(i + 1)]);
                }
              }}
              className={cn(inputClass, "h-10")}
            />
            <button type="button" onClick={() => onChange(options.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-subtle hover:bg-blush-soft hover:text-blush-ink" aria-label={`Remove choice ${i + 1}`}>
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...options, ""])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <Plus size={15} aria-hidden /> Add a choice
      </button>
    </fieldset>
  );
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={cn("flex items-center gap-3 rounded-xl border border-border px-3 py-2", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-border-strong")}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
      <span className="text-sm font-semibold text-fg">{label}</span>
    </label>
  );
}

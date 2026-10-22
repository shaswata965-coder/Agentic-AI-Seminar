"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-fg shadow-[inset_0_1px_2px_rgb(15_23_42/0.04)] transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-[color-mix(in_oklab,var(--brand)_18%,transparent)] focus:outline-none aria-[invalid=true]:border-blush-ink aria-[invalid=true]:ring-[color-mix(in_oklab,var(--blush)_25%,transparent)] disabled:opacity-60";

interface FieldShellProps {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  /** The word beside an optional field's name. */
  optional?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

export function FieldShell({ label, required, hint, error, className, optional = "optional", children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-fg">
        {label}
        {required ? (
          <span className="ml-0.5 text-blush-ink" aria-hidden>
            *
          </span>
        ) : optional ? (
          <span className="ml-1.5 text-xs font-medium text-subtle">({optional})</span>
        ) : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="text-sm font-medium text-blush-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { label: ReactNode; hint?: ReactNode; error?: string; className?: string; optional?: string };

export function TextField({ label, hint, error, className, required, optional, ...rest }: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <input id={id} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn(inputClass, "h-12")} {...rest} />
      )}
    </FieldShell>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & { label: ReactNode; hint?: ReactNode; error?: string; className?: string; optional?: string };

export function TextAreaField({ label, hint, error, className, required, optional, rows = 4, ...rest }: TextAreaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} rows={rows} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn(inputClass, "resize-y py-3")} {...rest} />
      )}
    </FieldShell>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  optional?: string;
};

export function SelectField({ label, hint, error, className, required, options, placeholder, optional, ...rest }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <select id={id} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn(inputClass, "h-12 appearance-none bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10 [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')]")} {...rest}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  description,
  error,
  className,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & { label: ReactNode; description?: ReactNode; error?: string; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 transition hover:border-border-strong has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
        <input id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" aria-invalid={error ? true : undefined} {...rest} />
        <span>
          <span className="block text-sm font-semibold text-fg">{label}</span>
          {description ? <span className="mt-0.5 block text-sm text-muted">{description}</span> : null}
        </span>
      </label>
      {error ? <p className="mt-1.5 text-sm font-medium text-blush-ink">{error}</p> : null}
    </div>
  );
}

/** A set of choices: one of them (radio buttons) or any number (tick boxes). */
export function ChoiceField({
  label,
  hint,
  error,
  required,
  optional = "optional",
  multiple,
  options,
  value,
  onChange,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  optional?: string;
  multiple: boolean;
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  className?: string;
}) {
  const id = useId();
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <fieldset className={cn("grid content-start gap-1.5", className)} aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined}>
      <legend className="mb-1.5 text-sm font-semibold text-fg">
        {label}
        {required ? (
          <span className="ml-0.5 text-blush-ink" aria-hidden>
            *
          </span>
        ) : optional ? (
          <span className="ml-1.5 text-xs font-medium text-subtle">({optional})</span>
        ) : null}
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {options.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-sm font-semibold text-fg transition hover:border-border-strong has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
            <input
              type={multiple ? "checkbox" : "radio"}
              name={id}
              value={o}
              checked={list.includes(o)}
              onChange={(e) => onChange(multiple ? (e.target.checked ? [...list, o] : list.filter((x) => x !== o)) : o)}
              aria-invalid={error ? true : undefined}
              className="h-5 w-5 shrink-0 accent-[var(--brand)]"
            />
            {o}
          </label>
        ))}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="text-sm font-medium text-blush-ink">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Visually hidden trap field for bots. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

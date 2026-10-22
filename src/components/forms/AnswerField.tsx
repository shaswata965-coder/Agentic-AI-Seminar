"use client";

import { cn } from "@/lib/cn";
import { autoCompleteOf, isWide, type Answer, type FormField, type FormKey } from "@/lib/forms";
import { CheckboxField, ChoiceField, SelectField, TextAreaField, TextField } from "./fields";

const INPUT_TYPE: Partial<Record<FormField["type"], string>> = { email: "email", tel: "tel", url: "url", date: "date" };

/** One field of an editable form (src/lib/forms.ts), drawn as its type of answer asks. */
export function AnswerField({ form, field: f, value, onChange, error, optional }: { form: FormKey; field: FormField; value: Answer | undefined; onChange: (v: Answer) => void; error?: string; optional: string }) {
  const str = typeof value === "string" ? value : "";
  const common = { label: f.label, hint: f.help || undefined, error, required: f.required, optional };
  switch (f.type) {
    case "textarea":
      return <TextAreaField {...common} rows={f.key === "accessibility" ? 2 : 4} value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder || undefined} />;
    case "select":
      return <SelectField {...common} value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder || "Choose one"} options={f.options.map((o) => ({ value: o, label: o }))} />;
    case "radio":
    case "checkboxes":
      return <ChoiceField {...common} multiple={f.type === "checkboxes"} options={f.options} value={Array.isArray(value) ? value : str} onChange={onChange} />;
    case "checkbox":
      return <CheckboxField label={f.label} description={f.help || undefined} checked={value === true} onChange={(e) => onChange(e.target.checked)} error={error} />;
    default:
      return (
        <TextField
          {...common}
          type={INPUT_TYPE[f.type] ?? "text"}
          inputMode={f.type === "number" ? "decimal" : undefined}
          autoComplete={autoCompleteOf(form, f.key)}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder || undefined}
        />
      );
  }
}

/** Fields laid out two to a row, long answers and choices across the whole row. */
export function AnswerFields({ form, fields, values, onChange, errors, optional, prefix = "" }: { form: FormKey; fields: FormField[]; values: Record<string, Answer>; onChange: (key: string, v: Answer) => void; errors: Record<string, string>; optional: string; prefix?: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={cn(isWide(f.type) && "sm:col-span-2")} data-field={f.key}>
          <AnswerField form={form} field={f} value={values[f.key]} onChange={(v) => onChange(f.key, v)} error={errors[`${prefix}${f.key}`]} optional={optional} />
        </div>
      ))}
    </div>
  );
}

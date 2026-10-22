import { z, type ZodType } from "zod";
import { fieldListProblems, formFields } from "@/lib/forms";
import { cleanLine, cleanText, harmlessLink, SAFE_LINK } from "@/lib/safe-text";
import type { FieldDef } from "@/lib/schema/fields";
import { arrange } from "@/lib/schema/section-order";

/*
 * Builds a zod schema from admin field definitions. Unknown keys are
 * stripped (so no other key, such as a "$" operator or "__proto__", can reach
 * the database), every value must have its field's type, strings are cleaned
 * of control characters, trimmed and length-capped, lists are capped, links
 * must be http(s), mailto, tel or a path on the site, and every field gets a
 * sensible empty default so partial documents can be saved.
 */

const OBJECT_ID = /^[a-f0-9]{24}$/i;
// Lists without their own limit.
const MAX_ITEMS = 200;

const msg = (f: FieldDef, text: string) => `${f.label}: ${text}`;

function str(f: FieldDef & { maxLength?: number }, fallbackMax = 5000, multiline = false) {
  let s = z
    .string({ message: msg(f, "must be text") })
    .overwrite(multiline ? cleanText : cleanLine)
    .trim()
    .max(f.maxLength ?? fallbackMax, msg(f, "too long"));
  if (f.required) s = s.min(1, msg(f, "required"));
  return s;
}

function fieldSchema(f: FieldDef): ZodType {
  switch (f.type) {
    case "text":
    case "tel":
      if (f.type === "text" && f.draftLink) return str(f, 2000).refine((v) => !v || harmlessLink(v), msg(f, "links must start with https://")).default("");
      return str(f, 300).default("");
    case "textarea":
    case "richtext":
      return str(f, 20000, true).default("");
    case "email":
      return str(f, 200)
        .refine((v) => !v || z.email().safeParse(v).success, msg(f, "enter a valid e-mail address"))
        .default("");
    case "url":
    case "image":
    case "file":
      return str(f, 2000)
        .refine((v) => !v || SAFE_LINK.test(v), msg(f, "enter a full link starting with https:// (or upload a file)"))
        .default("");
    case "color":
      return z.string().trim().refine((v) => !v || /^#[0-9a-fA-F]{6}$/.test(v), msg(f, "use a hex colour like #3b5bdb")).default("");
    case "number":
      return z.preprocess(
        (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
        z
          .number({ message: msg(f, "must be a number") })
          .min(f.min ?? -1e9, msg(f, `minimum ${f.min}`))
          .max(f.max ?? 1e9, msg(f, `maximum ${f.max}`))
          .nullable(),
      );
    case "boolean":
      return z.preprocess((v) => v === true || v === "true" || v === "on" || v === 1, z.boolean()).default(false);
    case "select": {
      const values = f.options.map((o) => o.value);
      return z
        .string()
        .refine((v) => (v === "" ? !f.required : values.includes(v)), msg(f, f.required ? "please choose an option" : "invalid option"))
        .default(f.required ? values[0] ?? "" : "");
    }
    case "multiselect": {
      const values = f.options.map((o) => o.value);
      return z
        .array(z.string().refine((v) => values.includes(v), msg(f, "invalid option")))
        .max(values.length, msg(f, "too many options"))
        .default([]);
    }
    case "date":
      return z.string().trim().max(10).refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), msg(f, "use YYYY-MM-DD")).default("");
    case "datetime":
      return z
        .string()
        .trim()
        .max(40, msg(f, "invalid date/time"))
        .refine((v) => (!v ? !f.required : !Number.isNaN(Date.parse(v))), msg(f, f.required ? "required" : "invalid date/time"))
        .default("");
    case "time":
      return z
        .string()
        .trim()
        .max(5, msg(f, "use HH:MM (24-hour)"))
        .refine((v) => (!v ? !f.required : /^([01]\d|2[0-3]):[0-5]\d$/.test(v)), msg(f, f.required ? "required" : "use HH:MM (24-hour)"))
        .default("");
    case "stringList":
      return z
        .array(z.string().overwrite(cleanLine).trim().max(1000, msg(f, "an item is too long")))
        .max(f.maxItems ?? MAX_ITEMS, msg(f, `at most ${f.maxItems ?? MAX_ITEMS} items`))
        .transform((a) => a.filter(Boolean))
        .refine((a) => !f.maxItems || a.length <= f.maxItems, msg(f, `at most ${f.maxItems} items`))
        .default([]);
    case "objectList":
      return z
        .array(objectSchema(f.fields))
        .max(f.maxItems ?? MAX_ITEMS, msg(f, `at most ${f.maxItems ?? MAX_ITEMS} items`))
        .default([]);
    case "group":
      return objectSchema(f.fields).default({} as never);
    case "ref":
      return z
        .union([z.literal(""), z.null(), z.string().regex(OBJECT_ID, msg(f, "invalid reference"))])
        .transform((v) => (v ? v : null))
        .default(null);
    case "refList":
      return z
        .array(z.string().regex(OBJECT_ID, msg(f, "invalid reference")))
        .max(MAX_ITEMS, msg(f, `at most ${MAX_ITEMS} items`))
        .default([]);
    case "formFields":
      // Made whole as it is saved (src/lib/forms.ts): built-in fields kept to what they may be.
      return z
        .unknown()
        .transform((v) => formFields(f.form, v))
        .superRefine((list, ctx) => {
          if (!f.draft) for (const problem of fieldListProblems(list)) ctx.addIssue({ code: "custom", message: msg(f, problem) });
        });
    case "order": {
      // Every option once: unknown items are dropped and missing ones put back in their default place.
      const values = f.options.map((o) => o.value);
      return z
        .array(z.string().max(100))
        .max(values.length * 2, msg(f, "too many items"))
        .transform((a) => arrange(values, a))
        .default(values);
    }
  }
}

export function objectSchema(fields: FieldDef[]) {
  const shape: Record<string, ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

/** The same field without required or format checks, so a preview can show work in progress. */
function loosen(f: FieldDef): FieldDef {
  switch (f.type) {
    case "url":
    case "image":
    case "file":
      // Unfinished links are fine in a preview; javascript: and the like are not.
      return { name: f.name, label: f.label, type: "text", maxLength: 2000, draftLink: true };
    case "email":
    case "date":
    case "datetime":
    case "time":
      return { name: f.name, label: f.label, type: "text", maxLength: 2000 };
    case "objectList":
    case "group":
      return { ...f, required: false, fields: f.fields.map(loosen) };
    case "formFields":
      return { ...f, draft: true };
    default:
      return { ...f, required: false };
  }
}

/** Validation for previews: shapes, types and length caps only. */
export function previewSchema(fields: FieldDef[]) {
  return objectSchema(fields.map(loosen));
}

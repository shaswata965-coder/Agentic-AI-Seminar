import { z, type ZodType } from "zod";
import type { FieldDef } from "@/lib/schema/fields";

/*
 * Builds a zod schema from admin field definitions. Unknown keys are
 * stripped, strings are trimmed and length-capped, and every field gets a
 * sensible empty default so partial documents can be saved.
 */

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const LINK = /^(https?:\/\/|\/|mailto:)/i;

const msg = (f: FieldDef, text: string) => `${f.label}: ${text}`;

function str(f: FieldDef & { maxLength?: number }, fallbackMax = 5000) {
  let s = z.string().trim().max(f.maxLength ?? fallbackMax, msg(f, "too long"));
  if (f.required) s = s.min(1, msg(f, "required"));
  return s;
}

function fieldSchema(f: FieldDef): ZodType {
  switch (f.type) {
    case "text":
    case "tel":
      return str(f, 300).default("");
    case "textarea":
    case "richtext":
      return str(f, 20000).default("");
    case "email":
      return str(f, 200)
        .refine((v) => !v || z.email().safeParse(v).success, msg(f, "enter a valid e-mail address"))
        .default("");
    case "url":
    case "image":
    case "file":
      return str(f, 2000)
        .refine((v) => !v || LINK.test(v), msg(f, "enter a full link starting with https:// (or upload a file)"))
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
      return z.array(z.string().refine((v) => values.includes(v), msg(f, "invalid option"))).default([]);
    }
    case "date":
      return z.string().trim().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), msg(f, "use YYYY-MM-DD")).default("");
    case "datetime":
      return z
        .string()
        .trim()
        .refine((v) => (!v ? !f.required : !Number.isNaN(Date.parse(v))), msg(f, f.required ? "required" : "invalid date/time"))
        .default("");
    case "time":
      return z
        .string()
        .trim()
        .refine((v) => (!v ? !f.required : /^([01]\d|2[0-3]):[0-5]\d$/.test(v)), msg(f, f.required ? "required" : "use HH:MM (24-hour)"))
        .default("");
    case "stringList":
      return z
        .array(z.string().trim().max(1000))
        .transform((a) => a.filter(Boolean))
        .refine((a) => !f.maxItems || a.length <= f.maxItems, msg(f, `at most ${f.maxItems} items`))
        .default([]);
    case "objectList":
      return z
        .array(objectSchema(f.fields))
        .refine((a) => !f.maxItems || a.length <= f.maxItems, msg(f, `at most ${f.maxItems} items`))
        .default([]);
    case "group":
      return objectSchema(f.fields).default({} as never);
    case "ref":
      return z
        .union([z.literal(""), z.null(), z.string().regex(OBJECT_ID, msg(f, "invalid reference"))])
        .transform((v) => (v ? v : null))
        .default(null);
    case "refList":
      return z.array(z.string().regex(OBJECT_ID, msg(f, "invalid reference"))).default([]);
  }
}

export function objectSchema(fields: FieldDef[]) {
  const shape: Record<string, ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

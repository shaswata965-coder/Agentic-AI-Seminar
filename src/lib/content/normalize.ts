import type { FieldDef } from "@/lib/schema/fields";

/** Mongo document → plain JSON object with `id` instead of `_id`. */
export function toPlain<T>(doc: unknown): T {
  const o = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  if (o._id !== undefined) {
    o.id = String(o._id);
    delete o._id;
  }
  delete o.__v;
  return o as T;
}

export function emptyValue(f: FieldDef): unknown {
  switch (f.type) {
    case "number":
      return null;
    case "boolean":
      return false;
    case "multiselect":
    case "stringList":
    case "objectList":
    case "refList":
      return [];
    case "group":
      return {};
    case "ref":
      return "";
    default:
      return "";
  }
}

/** Fill in missing fields so rendering code can rely on every key existing. */
export function fillDefaults<T>(fields: FieldDef[], obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...obj };
  for (const f of fields) {
    if (out[f.name] === undefined || out[f.name] === null) out[f.name] = emptyValue(f);
    if (f.type === "ref" && out[f.name] === null) out[f.name] = "";
  }
  return out as T;
}

/** Shallow merge of stored singleton data over defaults (ignoring null/undefined). */
export function mergeDefaults<T extends object>(defaults: T, stored: unknown): T {
  const out = { ...defaults } as Record<string, unknown>;
  if (stored && typeof stored === "object") {
    for (const [k, v] of Object.entries(stored as Record<string, unknown>)) {
      if (v !== undefined && v !== null && k in out) out[k] = v;
    }
  }
  return out as T;
}

/**
 * The site never shows an em dash. Text saved in the admin (or seeded before this rule) is cleaned
 * as it is read, without changing the database: "a — b" becomes "a, b", "Title — Name" becomes "Title: Name".
 */
export function noEmDash(text: string): string {
  if (!text.includes("—")) return text;
  return text
    .replace(/^[ \t]*—[ \t]*/gm, "")
    .replace(/[ \t]*—[ \t]*$/gm, "")
    .replace(/\s*—\s*(?=[A-Z0-9“"(])/g, ": ")
    .replace(/\s*—\s*/g, ", ");
}

/** `noEmDash` for every string inside a value, including nested objects and arrays. */
export function stripEmDashes<T>(value: T): T {
  if (typeof value === "string") return noEmDash(value) as T;
  if (Array.isArray(value)) return value.map(stripEmDashes) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, stripEmDashes(v)])) as T;
  return value;
}

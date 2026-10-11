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

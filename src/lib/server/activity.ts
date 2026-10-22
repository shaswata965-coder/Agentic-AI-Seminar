import "server-only";
import type { ActivityAction, ActivityChange } from "@/lib/activity";
import { formatDateTime } from "@/lib/format";
import { ANSWER_TYPE_LABELS, ANSWER_TYPES } from "@/lib/forms";
import { Activity, getCollectionModel } from "@/lib/models";
import { bool, list, num, select, text, type FieldDef } from "@/lib/schema/fields";
import { COLLECTION_MAP, type CollectionDef } from "@/lib/schema/resources";
import type { AdminUser } from "./admin-auth";

/*
 * The task tracker records everything volunteers change in the admin panel,
 * with a field-by-field description of what changed, for administrators to
 * review. Administrators and editors are not tracked.
 */

const IGNORED = new Set(["id", "_id", "__v", "createdAt", "updatedAt"]);
const MAX_VALUE = 500;
const MAX_CHANGES = 100;

export const isTracked = (user: AdminUser) => user.role === "volunteer";

/** How a content item is named in the tracker. */
export const contentTitle = (def: CollectionDef, item: Record<string, unknown>) => String(item[def.titleKey] ?? "") || `Untitled ${def.singular.toLowerCase()}`;

interface Entry {
  action: ActivityAction;
  /** A permission key such as "content:speakers", or "account". */
  area: string;
  target?: string;
  targetId?: string;
  changes?: ActivityChange[];
  /** Two versions of the record to describe the changes from (null for one that was created or deleted). */
  diff?: { fields?: FieldDef[]; before: unknown; after: unknown };
}

/** Add an entry to the task tracker if a volunteer did this. Never throws: the change itself has already been made. */
export async function recordActivity(user: AdminUser, entry: Entry): Promise<void> {
  if (!isTracked(user)) return;
  try {
    const { diff, ...rest } = entry;
    const changes = rest.changes ?? (diff ? await describeChanges(diff.fields, diff.before, diff.after) : []);
    if ((rest.action === "updated" || rest.action === "reordered") && !changes.length) return; // saved without changing anything
    await Activity.create({ actorId: user.id, actorName: user.name, actorEmail: user.email, ...rest, changes });
  } catch (err) {
    console.error("[activity] Could not record a volunteer's change", err);
  }
}

/* ---------------------------------------------------------------- Diffs -- */

interface Leaf {
  label: string;
  raw: unknown;
  def?: FieldDef;
  /** Shown in place of the value, when that is compared by something else (a form's order, by its fields' keys). */
  shown?: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** What a form's field is described by in the tracker. */
const FORM_FIELD_PARTS: FieldDef[] = [
  text("label", "Field name"),
  select("type", "Type of answer", ANSWER_TYPES.map((t) => ({ value: t, label: ANSWER_TYPE_LABELS[t] }))),
  text("help", "Guide"),
  text("placeholder", "Example"),
  list("options", "Choices"),
  bool("required", "Required"),
  bool("leadOnly", "Required for the team lead only"),
  bool("hidden", "Hidden"),
  num("step", "Step"),
];

// Flatten a record into labelled leaves ("Fees › Fee 2 › Amount"), following the admin form's field definitions when there are any.
function collect(value: unknown, def: FieldDef | undefined, path: string, label: string, out: Map<string, Leaf>) {
  if (def?.type === "formFields") {
    // By each field's key, so moving a field doesn't read as every field changing.
    for (const item of Array.isArray(value) ? value : []) {
      if (!isRecord(item)) continue;
      collectObject(item, FORM_FIELD_PARTS, `${path}.${String(item.key)}`, `${label} › ${String(item.label ?? item.key)}`, out);
    }
    const items = (Array.isArray(value) ? value : []).filter(isRecord);
    out.set(`${path}.#order`, { label: `${label} › Order`, raw: items.map((x) => String(x.key)), shown: items.map((x) => String(x.label ?? x.key)).join(", ") });
  } else if (def?.type === "objectList" || (!def && Array.isArray(value) && value.some(isRecord))) {
    const fields = def?.type === "objectList" ? def.fields : undefined;
    const item = def?.type === "objectList" ? def.itemLabel : "Item";
    (Array.isArray(value) ? value : []).forEach((v, i) => collectObject(v, fields, `${path}.${i}`, `${label} › ${item} ${i + 1}`, out));
  } else if (def?.type === "group" || (!def && isRecord(value))) {
    collectObject(value, def?.type === "group" ? def.fields : undefined, path, label, out);
  } else {
    out.set(path, { label, raw: value, def });
  }
}

function collectObject(value: unknown, fields: FieldDef[] | undefined, path: string, label: string, out: Map<string, Leaf>) {
  const obj = isRecord(value) ? value : {};
  const names = fields ? fields.map((f) => f.name) : Object.keys(obj).filter((k) => !IGNORED.has(k));
  for (const name of names) {
    const def = fields?.find((f) => f.name === name);
    const own = def?.label ?? name;
    collect(obj[name], def, path ? `${path}.${name}` : name, label ? `${label} › ${own}` : own, out);
  }
}

function format(raw: unknown, def: FieldDef | undefined, titles: Map<string, string>): string {
  if (raw === null || raw === undefined) return "";
  if (Array.isArray(raw)) return raw.map((v) => format(v, def, titles)).filter(Boolean).join(", ");
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  const s = typeof raw === "object" ? JSON.stringify(raw) : String(raw);
  if (!s) return "";
  if (def?.type === "select" || def?.type === "multiselect" || def?.type === "order") return def.options.find((o) => o.value === s)?.label ?? s;
  if (def?.type === "ref" || def?.type === "refList") return titles.get(s) ?? s;
  if (def?.type === "datetime") return `${formatDateTime(s) || s} IST`;
  return s;
}

const clip = (s: string) => (s.length > MAX_VALUE ? `${s.slice(0, MAX_VALUE - 1)}…` : s);

// Names of linked items (a session's speakers), so the tracker doesn't show database IDs.
async function refTitles(leaves: Leaf[]): Promise<Map<string, string>> {
  const wanted = new Map<string, Set<string>>();
  for (const l of leaves) {
    if (l.def?.type !== "ref" && l.def?.type !== "refList") continue;
    const ids = (Array.isArray(l.raw) ? l.raw : [l.raw]).map(String).filter((id) => /^[a-f0-9]{24}$/i.test(id));
    if (!wanted.has(l.def.resource)) wanted.set(l.def.resource, new Set());
    for (const id of ids) wanted.get(l.def.resource)!.add(id);
  }
  const titles = new Map<string, string>();
  await Promise.all(
    [...wanted].map(async ([resource, ids]) => {
      const def = COLLECTION_MAP[resource];
      if (!def || !ids.size) return;
      const docs = await getCollectionModel(resource).find({ _id: { $in: [...ids] } }, { [def.titleKey]: 1 }).lean();
      for (const d of docs) titles.set(String(d._id), String(d[def.titleKey] ?? "") || String(d._id));
    }),
  );
  return titles;
}

/** Field-by-field differences between two versions of a record, labelled as in the admin form. */
export async function describeChanges(fields: FieldDef[] | undefined, before: unknown, after: unknown): Promise<ActivityChange[]> {
  const was = new Map<string, Leaf>();
  const now = new Map<string, Leaf>();
  collectObject(before, fields, "", "", was);
  collectObject(after, fields, "", "", now);
  const none = new Map<string, string>();
  const plain = (l?: Leaf) => (l ? format(l.raw, l.def, none) : "");
  const changed = [...new Set([...was.keys(), ...now.keys()])].filter((p) => plain(was.get(p)) !== plain(now.get(p))).slice(0, MAX_CHANGES);
  const titles = await refTitles(changed.flatMap((p) => [was.get(p), now.get(p)]).filter((l): l is Leaf => l !== undefined));
  const text = (l?: Leaf) => (l ? clip(l.shown ?? format(l.raw, l.def, titles)) : "");
  return changed.map((p) => ({ field: (now.get(p) ?? was.get(p))!.label, from: text(was.get(p)), to: text(now.get(p)) }));
}

/** The stretch of a list whose order changed ("B, C" → "C, B"), rather than the whole list. */
export function describeOrder(before: { id: string; title: string }[], after: { id: string; title: string }[]): ActivityChange[] {
  let start = 0;
  while (start < before.length && before[start]?.id === after[start]?.id) start++;
  let end = 0;
  while (end < before.length - start && before[before.length - 1 - end]?.id === after[after.length - 1 - end]?.id) end++;
  const titles = (list: { title: string }[]) => clip(list.slice(start, list.length - end).map((x) => x.title).join(", "));
  return start === before.length && before.length === after.length ? [] : [{ field: "Order", from: titles(before), to: titles(after) }];
}

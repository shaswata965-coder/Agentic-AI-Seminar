"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails */
import { ArrowDown, ArrowUp, Check, ExternalLink, EyeOff, Pencil, Plus, Search, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { emptyValue } from "@/lib/content/normalize";
import { formatDateTime } from "@/lib/format";
import { withBase } from "@/lib/paths";
import type { FieldDef } from "@/lib/schema/fields";
import { COLLECTION_MAP, type Column } from "@/lib/schema/resources";
import { PageTitle } from "./AdminShell";
import { api, ApiError, useApi } from "./api";
import { RecordForm } from "./RecordForm";
import { invalidateOptions } from "./RefSelect";

type Item = Record<string, unknown> & { id: string };

function optionLabel(fields: FieldDef[], key: string, value: unknown) {
  const f = fields.find((x) => x.name === key);
  if (f && (f.type === "select" || f.type === "multiselect")) return f.options.find((o) => o.value === value)?.label ?? String(value ?? "");
  return String(value ?? "");
}

function Cell({ col, item, fields }: { col: Column; item: Item; fields: FieldDef[] }) {
  const v = item[col.key];
  switch (col.kind) {
    case "image":
      return v ? <img src={withBase(String(v))} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-border" /> : <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-xs text-subtle">—</span>;
    case "boolean":
      return v ? <Check size={18} className="text-mint-ink" aria-label="Yes" /> : <span className="text-subtle" aria-label="No">—</span>;
    case "date":
      return <span className="whitespace-nowrap text-muted">{v ? formatDateTime(String(v)) : "—"}</span>;
    case "option":
      return v ? <Badge tone="neutral" size="xs" className="whitespace-nowrap">{optionLabel(fields, col.key, v)}</Badge> : <span className="text-subtle">—</span>;
    default:
      return <span className="line-clamp-2 font-medium text-fg">{String(v ?? "") || "—"}</span>;
  }
}

export function ResourceManager({ resourceKey }: { resourceKey: string }) {
  const def = COLLECTION_MAP[resourceKey];
  const toast = useToast();
  const { data, error, loading, reload, setData } = useApi<Item[]>(`/content/${resourceKey}`);
  const [q, setQ] = useState("");
  const [show, setShow] = useState<"all" | "published" | "hidden">("all");
  const [editing, setEditing] = useState<Item | Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Item | null>(null);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? []).filter((it) => {
      if (show === "published" && !it.published) return false;
      if (show === "hidden" && it.published) return false;
      if (!needle) return true;
      return def.columns.some((c) => String(it[c.key] ?? "").toLowerCase().includes(needle)) || String(it[def.titleKey] ?? "").toLowerCase().includes(needle);
    });
  }, [data, q, show, def]);

  const canReorder = "order" in def.sort || def.fields.some((f) => f.name === "order");
  const fieldNames = new Set(def.fields.map((f) => f.name));

  function blank() {
    const v: Record<string, unknown> = {};
    for (const f of def.fields) v[f.name] = f.type === "select" && f.required ? f.options[0]?.value ?? "" : emptyValue(f);
    return { ...v, ...(def.defaults ?? {}) };
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setErrors({});
    const body = Object.fromEntries(Object.entries(editing).filter(([k]) => fieldNames.has(k)));
    try {
      if ("id" in editing && editing.id) await api(`/content/${resourceKey}/${editing.id}`, { method: "PUT", json: body });
      else await api(`/content/${resourceKey}`, { method: "POST", json: body });
      toast(`${def.singular} saved — the website is updated.`, "success");
      invalidateOptions(resourceKey);
      setEditing(null);
      reload();
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fieldErrors);
        toast(e.message, "error");
      } else toast("Could not save.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(it: Item) {
    const body = Object.fromEntries(Object.entries({ ...it, published: !it.published }).filter(([k]) => fieldNames.has(k)));
    try {
      await api(`/content/${resourceKey}/${it.id}`, { method: "PUT", json: body });
      setData((list) => (list ?? []).map((x) => (x.id === it.id ? { ...x, published: !it.published } : x)));
      toast(it.published ? "Hidden from the website" : "Published", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  }

  async function move(it: Item, d: number) {
    const list = [...(data ?? [])];
    const i = list.findIndex((x) => x.id === it.id);
    const j = i + d;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setData(list);
    try {
      await api(`/content/${resourceKey}/reorder`, { method: "POST", json: { ids: list.map((x) => x.id) } });
    } catch {
      toast("Could not reorder", "error");
      reload();
    }
  }

  async function remove(it: Item) {
    try {
      await api(`/content/${resourceKey}/${it.id}`, { method: "DELETE" });
      toast(`${def.singular} deleted`, "success");
      invalidateOptions(resourceKey);
      setConfirm(null);
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  const title = (it: Record<string, unknown>) => String(it[def.titleKey] ?? "") || `Untitled ${def.singular.toLowerCase()}`;

  return (
    <div>
      <PageTitle
        title={def.label}
        description={def.description}
        actions={
          <>
            {def.publicPath ? (
              <a href={withBase(def.publicPath)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-fg hover:border-brand">
                <ExternalLink size={16} aria-hidden /> View on site
              </a>
            ) : null}
            <Button
              onClick={() => {
                setErrors({});
                setEditing(blank());
              }}
              icon={<Plus size={18} aria-hidden />}
            >
              New {def.singular.toLowerCase()}
            </Button>
          </>
        }
      />

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search</span>
          <Search size={17} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}…`} className="h-10 w-full rounded-full border border-border bg-surface pr-4 pl-10 text-sm focus:border-brand focus:outline-none" />
        </label>
        <div className="inline-flex rounded-full border border-border bg-surface p-1" role="group" aria-label="Filter by visibility">
          {(["all", "published", "hidden"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={show === v} onClick={() => setShow(v)} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold capitalize", show === v ? "bg-brand text-brand-fg" : "text-muted hover:text-fg")}>
              {v}
            </button>
          ))}
        </div>
        <span className="text-sm text-subtle">{data ? `${items.length} of ${data.length}` : ""}</span>
      </div>

      {loading ? <div className="card p-10 text-center text-muted">Loading…</div> : null}
      {error ? <div className="card p-6 text-blush-ink">{error}</div> : null}

      {data && !data.length ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <Aura variant="admin" size={130} />
          <p className="mt-3 font-display text-xl font-semibold text-fg">No {def.label.toLowerCase()} yet</p>
          <p className="mt-1 text-muted">The website shows a friendly placeholder until you add some.</p>
          <Button className="mt-5" onClick={() => setEditing(blank())} icon={<Plus size={18} aria-hidden />}>
            Add the first {def.singular.toLowerCase()}
          </Button>
        </div>
      ) : null}

      {items.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface-2 text-xs tracking-[0.08em] text-subtle uppercase">
              <tr>
                {def.columns.map((c) => (
                  <th key={c.key} scope="col" className="px-4 py-3 font-bold">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} className={cn("border-b border-border last:border-0 hover:bg-surface-2/60", !it.published && "opacity-70")}>
                  {def.columns.map((c, ci) => (
                    <td key={c.key} className="px-4 py-3 align-middle">
                      {ci === 1 || (ci === 0 && c.kind !== "image") ? (
                        <button type="button" onClick={() => { setErrors({}); setEditing(it); }} className="text-left hover:text-brand">
                          <Cell col={c} item={it} fields={def.fields} />
                        </button>
                      ) : (
                        <Cell col={c} item={it} fields={def.fields} />
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      {canReorder && !q && show === "all" ? (
                        <>
                          <button type="button" onClick={() => move(it, -1)} disabled={idx === 0} className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg disabled:opacity-30" aria-label={`Move ${title(it)} up`}>
                            <ArrowUp size={16} />
                          </button>
                          <button type="button" onClick={() => move(it, 1)} disabled={idx === items.length - 1} className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg disabled:opacity-30" aria-label={`Move ${title(it)} down`}>
                            <ArrowDown size={16} />
                          </button>
                        </>
                      ) : null}
                      <button type="button" onClick={() => togglePublish(it)} className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg" aria-label={it.published ? `Hide ${title(it)}` : `Publish ${title(it)}`} title={it.published ? "Hide from website" : "Publish"}>
                        {it.published ? <EyeOff size={16} /> : <Check size={16} />}
                      </button>
                      <button type="button" onClick={() => { setErrors({}); setEditing(it); }} className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg" aria-label={`Edit ${title(it)}`} title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => setConfirm(it)} className="grid h-9 w-9 place-items-center rounded-lg text-subtle hover:bg-blush-soft hover:text-blush-ink" aria-label={`Delete ${title(it)}`} title="Delete">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={editing !== null} onClose={() => !saving && setEditing(null)} labelledBy="editor-title" size="xl">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="border-b border-border px-6 py-5 pr-16">
              <p className="text-xs font-bold tracking-[0.12em] text-subtle uppercase">{"id" in editing && editing.id ? `Edit ${def.singular.toLowerCase()}` : `New ${def.singular.toLowerCase()}`}</p>
              <h2 id="editor-title" className="mt-1 font-display text-2xl font-bold text-fg">
                {title(editing)}
              </h2>
            </div>
            <div className="px-6 py-6">
              {Object.keys(errors).length ? (
                <p role="alert" className="mb-5 rounded-xl bg-blush-soft px-4 py-3 text-sm font-medium text-blush-ink">
                  Please fix the highlighted fields.
                </p>
              ) : null}
              <RecordForm fields={def.fields} value={editing} onChange={setEditing} errors={errors} />
            </div>
            <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-b-[1.75rem] border-t border-border bg-surface px-6 py-4">
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} labelledBy="confirm-title" size="md">
        {confirm ? (
          <div className="p-6">
            <h2 id="confirm-title" className="font-display text-xl font-bold text-fg">
              Delete “{title(confirm)}”?
            </h2>
            <p className="mt-2 text-muted">This removes it from the website immediately and can&apos;t be undone. Tip: you can hide it instead.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button className="bg-blush-ink text-white hover:bg-blush-ink" onClick={() => remove(confirm)}>
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

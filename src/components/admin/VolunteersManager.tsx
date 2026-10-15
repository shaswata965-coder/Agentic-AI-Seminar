"use client";

import { Pencil, Trash, UserRoundPlus, Wand } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { areasOf, DELETE_PERMISSION, PERMISSION_GROUPS } from "@/lib/permissions";
import { PageTitle } from "./AdminShell";
import { api, ApiError, useApi } from "./api";

interface Volunteer {
  id: string;
  email: string;
  name: string;
  responsibility: string;
  permissions: string[];
  active: boolean;
  lastLoginAt: string | null;
  changes: number;
  toReview: number;
}

interface Draft {
  id?: string;
  name: string;
  email: string;
  responsibility: string;
  permissions: string[];
  password: string;
}

const blank = (): Draft => ({ name: "", email: "", responsibility: "", permissions: [], password: "" });

/** A random password without look-alike characters, for the admin to pass on. */
function generatePassword(length = 14) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function Access({ permissions }: { permissions: string[] }) {
  const areas = areasOf(permissions);
  if (!areas.length) return <span className="text-subtle">No access yet</span>;
  const shown = areas.slice(0, 3);
  return (
    <span className="flex flex-wrap gap-1">
      {shown.map((a) => (
        <Badge key={a.key} tone="neutral" size="xs">
          {a.label}
        </Badge>
      ))}
      {areas.length > shown.length ? (
        <Badge tone="neutral" size="xs">
          +{areas.length - shown.length} more
        </Badge>
      ) : null}
      {permissions.includes("delete") ? (
        <Badge tone="blush" size="xs">
          can delete
        </Badge>
      ) : null}
    </span>
  );
}

function PermissionPicker({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const toggle = (key: string, on: boolean) => onChange(on ? [...value, key] : value.filter((k) => k !== key));
  const box = "flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 transition hover:border-border-strong has-[:checked]:border-brand has-[:checked]:bg-brand-soft";
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-3 text-sm font-semibold text-fg">
        Permissions
        <span className="mt-0.5 block text-xs font-normal text-subtle">They can open and change only the areas you tick. Everything they change shows up in the task tracker.</span>
      </legend>
      {PERMISSION_GROUPS.map((g) => {
        const all = g.items.every((p) => value.includes(p.key));
        return (
          <div key={g.title}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                {g.title}
                {g.hint ? <span className="ml-2 font-normal tracking-normal normal-case">{g.hint}</span> : null}
              </p>
              <button
                type="button"
                onClick={() => onChange(all ? value.filter((k) => !g.items.some((p) => p.key === k)) : [...new Set([...value, ...g.items.map((p) => p.key)])])}
                className="text-xs font-semibold text-brand hover:underline"
              >
                {all ? "Clear" : "Select all"}
              </button>
            </div>
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
              {g.items.map((p) => (
                <label key={p.key} className={box}>
                  <input type="checkbox" checked={value.includes(p.key)} onChange={(e) => toggle(p.key, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fg">{p.label}</span>
                    {p.hint ? <span className="block text-xs text-muted">{p.hint}</span> : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <label className={cn(box, "has-[:checked]:border-blush-ink has-[:checked]:bg-blush-soft")}>
        <input type="checkbox" checked={value.includes(DELETE_PERMISSION.key)} onChange={(e) => toggle(DELETE_PERMISSION.key, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--blush-ink)]" />
        <span>
          <span className="block text-sm font-semibold text-fg">{DELETE_PERMISSION.label}</span>
          <span className="block text-xs text-muted">{DELETE_PERMISSION.hint}</span>
        </span>
      </label>
      {error ? <p className="text-sm font-medium text-blush-ink">{error}</p> : null}
    </fieldset>
  );
}

export function VolunteersManager() {
  const toast = useToast();
  const { data, error, loading, reload } = useApi<Volunteer[]>("/volunteers");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Volunteer | null>(null);

  function open(d: Draft) {
    setErrors({});
    setDraft(d);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setErrors({});
    const { id, password, ...rest } = draft;
    try {
      if (id) {
        await api(`/volunteers/${id}`, { method: "PATCH", json: password ? { ...rest, password } : rest });
        toast(password ? "Volunteer updated. Share the new password with them securely." : "Volunteer updated", "success");
      } else {
        await api("/volunteers", { method: "POST", json: { ...rest, password } });
        toast("Volunteer added. Share their e-mail and password with them securely.", "success");
      }
      setDraft(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
      toast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function setActive(v: Volunteer, active: boolean) {
    try {
      await api(`/volunteers/${v.id}`, { method: "PATCH", json: { active } });
      toast(active ? `${v.name} can sign in again` : `${v.name} can no longer sign in`, "success");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  async function remove(v: Volunteer) {
    try {
      await api(`/volunteers/${v.id}`, { method: "DELETE" });
      toast(`${v.name} removed. Their changes stay in the task tracker.`, "success");
      setConfirm(null);
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  return (
    <div>
      <PageTitle
        title="Volunteers"
        description={
          <>
            Sign-in accounts for volunteers, each with a responsibility and only the permissions you choose. Every change they make is recorded in the{" "}
            <Link href="/admin/tracker" className="font-semibold text-brand underline">
              task tracker
            </Link>
            . To list volunteers on the website, use{" "}
            <Link href="/admin/content/people" className="font-semibold text-brand underline">
              Organisers &amp; volunteers
            </Link>
            .
          </>
        }
        actions={
          <Button onClick={() => open({ ...blank(), password: generatePassword() })} icon={<UserRoundPlus size={17} aria-hidden />}>
            Add volunteer
          </Button>
        }
      />
      {error ? <p className="card mb-4 p-4 text-blush-ink">{error}</p> : null}
      {loading ? <div className="card p-10 text-center text-muted">Loading…</div> : null}

      {data && !data.length ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <Aura variant="admin" size={130} />
          <p className="mt-3 font-display text-xl font-semibold text-fg">No volunteers yet</p>
          <p className="mt-1 max-w-md text-muted">Give a volunteer their own sign-in, a responsibility and access to just the parts of the panel they need.</p>
          <Button className="mt-5" onClick={() => open({ ...blank(), password: generatePassword() })} icon={<UserRoundPlus size={17} aria-hidden />}>
            Add the first volunteer
          </Button>
        </div>
      ) : null}

      {data?.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border bg-surface-2 text-xs tracking-[0.08em] text-subtle uppercase">
              <tr>
                <th className="px-4 py-3">Volunteer</th>
                <th className="px-4 py-3">Responsibility</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Changes</th>
                <th className="px-4 py-3">Last sign-in</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v) => (
                <tr key={v.id} className={cn("border-b border-border align-top last:border-0", !v.active && "opacity-70")}>
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-fg">{v.name || v.email}</span>
                    <span className="text-xs text-subtle">{v.email}</span>
                    {!v.active ? (
                      <Badge tone="blush" size="xs" className="ml-2">
                        disabled
                      </Badge>
                    ) : null}
                  </td>
                  <td className="max-w-[16rem] px-4 py-3">
                    <span className="line-clamp-3 text-muted">{v.responsibility || "-"}</span>
                  </td>
                  <td className="max-w-[18rem] px-4 py-3">
                    <Access permissions={v.permissions} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {v.changes ? (
                      <Link href={`/admin/tracker?volunteer=${v.id}`} className="font-semibold text-brand hover:underline">
                        {v.changes} {v.changes === 1 ? "change" : "changes"}
                      </Link>
                    ) : (
                      <span className="text-subtle">None yet</span>
                    )}
                    {v.toReview ? (
                      <span className="mt-1 block">
                        <Badge tone="lilac" size="xs" dot>
                          {v.toReview} to review
                        </Badge>
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{v.lastLoginAt ? formatDateTime(v.lastLoginAt) : "Never"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => open({ id: v.id, name: v.name, email: v.email, responsibility: v.responsibility, permissions: v.permissions, password: "" })} icon={<Pencil size={15} aria-hidden />}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setActive(v, !v.active)}>
                        {v.active ? "Disable" : "Enable"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-blush-ink" onClick={() => setConfirm(v)} aria-label={`Remove ${v.name || v.email}`}>
                        <Trash size={15} aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={draft !== null} onClose={() => !saving && setDraft(null)} labelledBy="volunteer-title" size="xl">
        {draft ? (
          <form onSubmit={save}>
            <div className="border-b border-border px-6 py-5 pr-16">
              <p className="text-xs font-bold tracking-[0.12em] text-subtle uppercase">{draft.id ? "Edit volunteer" : "New volunteer"}</p>
              <h2 id="volunteer-title" className="mt-1 font-display text-2xl font-bold text-fg">
                {draft.name || "Add a volunteer"}
              </h2>
            </div>
            <div className="grid gap-5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} error={errors.name} autoComplete="off" />
                <TextField label="E-mail" type="email" required value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} error={errors.email} hint="They sign in with this." autoComplete="off" />
              </div>
              <TextAreaField
                label="Responsibility"
                required
                rows={2}
                maxLength={500}
                value={draft.responsibility}
                onChange={(e) => setDraft({ ...draft, responsibility: e.target.value })}
                error={errors.responsibility}
                placeholder="e.g. Speaker coordination: keep speaker profiles and the programme up to date."
                hint="Shown to them when they sign in, and to administrators here."
              />
              <div className="grid items-start gap-2 sm:grid-cols-[1fr_auto]">
                <TextField
                  label={draft.id ? "New password" : "Password"}
                  required={!draft.id}
                  type="text"
                  autoComplete="new-password"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  error={errors.password}
                  hint={draft.id ? "Leave blank to keep their current password." : "At least 10 characters. They can change it under “My account”."}
                />
                <Button variant="outline" className="sm:mt-7" onClick={() => setDraft({ ...draft, password: generatePassword() })} icon={<Wand size={16} aria-hidden />}>
                  Generate
                </Button>
              </div>
              <PermissionPicker value={draft.permissions} onChange={(permissions) => setDraft({ ...draft, permissions })} error={errors.permissions} />
            </div>
            <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-b-[1.75rem] border-t border-border bg-surface px-6 py-4">
              <Button variant="ghost" onClick={() => setDraft(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : draft.id ? "Save changes" : "Add volunteer"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} labelledBy="remove-volunteer-title" size="md">
        {confirm ? (
          <div className="p-6">
            <h2 id="remove-volunteer-title" className="font-display text-xl font-bold text-fg">
              Remove {confirm.name || confirm.email}?
            </h2>
            <p className="mt-2 text-muted">They will no longer be able to sign in. Their changes stay in the task tracker. To pause their access instead, use “Disable”.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button className="bg-blush-ink text-white hover:bg-blush-ink" onClick={() => remove(confirm)}>
                Remove
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

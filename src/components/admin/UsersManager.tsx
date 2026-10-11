"use client";

import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SelectField, TextField } from "@/components/forms/fields";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/format";
import { PageTitle, useMe } from "./AdminShell";
import { api, ApiError, useApi } from "./api";

interface U {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  active: boolean;
  lastLoginAt: string | null;
}

export function UsersManager() {
  const me = useMe();
  const toast = useToast();
  const { data, error, reload } = useApi<U[]>("/users");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "editor", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reset, setReset] = useState<U | null>(null);
  const [newPassword, setNewPassword] = useState("");

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/users", { method: "POST", json: form });
      toast("User added. Share their password with them securely.", "success");
      setAdding(false);
      setForm({ email: "", name: "", role: "editor", password: "" });
      reload();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }
  async function patch(u: U, body: Record<string, unknown>, msg: string) {
    try {
      await api(`/users/${u.id}`, { method: "PATCH", json: body });
      toast(msg, "success");
      reload();
      return true;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
      return false;
    }
  }
  async function remove(u: U) {
    if (!window.confirm(`Remove ${u.email}? They will no longer be able to sign in.`)) return;
    await api(`/users/${u.id}`, { method: "DELETE" }).then(reload, (err: Error) => toast(err.message, "error"));
  }

  if (me && me.role !== "admin") return <p className="card p-6 text-muted">Only administrators can manage users.</p>;

  return (
    <div>
      <PageTitle
        title="Users"
        description="People who can sign in to this admin panel. Editors manage content; administrators can also manage users and delete responses."
        actions={
          <Button onClick={() => setAdding(true)} icon={<UserPlus size={17} aria-hidden />}>
            Add user
          </Button>
        }
      />
      {error ? <p className="card p-4 text-blush-ink">{error}</p> : null}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-xs tracking-[0.08em] text-subtle uppercase">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <span className="block font-semibold text-fg">{u.name || u.email}</span>
                  <span className="text-xs text-subtle">{u.email}</span>
                  {!u.active ? (
                    <Badge tone="blush" size="xs" className="ml-2">
                      disabled
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <select value={u.role} disabled={u.id === me?.id} onChange={(e) => patch(u, { role: e.target.value }, "Role updated")} className="h-9 rounded-lg border border-border bg-surface px-2 text-sm" aria-label={`Role for ${u.email}`}>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-muted">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setReset(u)}>
                      Reset password
                    </Button>
                    {u.id !== me?.id ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => patch(u, { active: !u.active }, u.active ? "User disabled" : "User enabled")}>
                          {u.active ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-blush-ink" onClick={() => remove(u)}>
                          Remove
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} labelledBy="add-user-title" size="md">
        <form onSubmit={create} className="grid gap-4 p-6">
          <h2 id="add-user-title" className="font-display text-xl font-bold text-fg">
            Add a user
          </h2>
          <TextField label="E-mail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <SelectField label="Role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: "editor", label: "Editor: manage content" }, { value: "admin", label: "Administrator: everything" }]} />
          <TextField label="Temporary password" type="text" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} hint="At least 10 characters. Ask them to change it under “My account”." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit">Add user</Button>
          </div>
        </form>
      </Modal>

      <Modal open={reset !== null} onClose={() => setReset(null)} labelledBy="reset-title" size="md">
        <form
          className="grid gap-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (reset && (await patch(reset, { password: newPassword }, "Password reset"))) {
              setReset(null);
              setNewPassword("");
            }
          }}
        >
          <h2 id="reset-title" className="font-display text-xl font-bold text-fg">
            Reset password for {reset?.email}
          </h2>
          <TextField label="New password" type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint="At least 10 characters." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReset(null)}>
              Cancel
            </Button>
            <Button type="submit">Reset password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

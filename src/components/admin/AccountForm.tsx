"use client";

import { useState, type FormEvent } from "react";
import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { PageTitle, useMe } from "./AdminShell";
import { api, ApiError } from "./api";

export function AccountForm() {
  const me = useMe();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setErrors({ confirm: "The new passwords don't match." });
      return;
    }
    try {
      await api("/users/me/password", { method: "POST", json: { current, next } });
      toast("Password changed", "success");
      setCurrent("");
      setNext("");
      setConfirm("");
      setErrors({});
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  return (
    <div className="max-w-xl">
      <PageTitle title="My account" description={me ? `Signed in as ${me.email} (${me.role}).` : undefined} />
      <form onSubmit={onSubmit} className="card grid gap-4 p-6">
        <h2 className="font-display text-xl font-bold text-fg">Change password</h2>
        <TextField label="Current password" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.current} />
        <TextField label="New password" type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} hint="At least 10 characters." />
        <TextField label="Confirm new password" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <div>
          <Button type="submit">Update password</Button>
        </div>
      </form>
    </div>
  );
}

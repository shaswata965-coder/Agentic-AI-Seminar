"use client";

import { Laptop, LogOut } from "lucide-react";
import { useState, type FormEvent } from "react";
import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/format";
import { PASSWORD_MAX_BYTES, PASSWORD_MIN } from "@/lib/password-rules";
import { PageTitle, useMe } from "./AdminShell";
import { api, ApiError, useApi } from "./api";

interface SessionRow {
  current: boolean;
  userAgent: string;
  createdAt: string | null;
  lastSeenAt: string;
}

/** "Chrome on Windows", from a browser's user-agent string. */
function device(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "A browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

/** Where the user is signed in, with a way to sign out everywhere else. */
function Sessions() {
  const toast = useToast();
  const { data, reload } = useApi<SessionRow[]>("/auth/sessions");
  const others = (data ?? []).filter((s) => !s.current).length;
  async function signOutOthers() {
    try {
      await api("/auth/sessions", { method: "DELETE" });
      toast("Signed out on your other devices.", "success");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  }
  return (
    <section className="card mt-6 grid gap-4 p-6" aria-labelledby="sessions">
      <div>
        <h2 id="sessions" className="font-display text-xl font-bold text-fg">
          Where you&apos;re signed in
        </h2>
        <p className="mt-1 text-sm text-muted">Each sign-in lasts 7 days. Changing your password signs you out everywhere else.</p>
      </div>
      <ul className="grid gap-2">
        {(data ?? []).map((s, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl border border-border px-3 py-2.5 text-sm">
            <Laptop size={18} aria-hidden className="mt-0.5 shrink-0 text-subtle" />
            <span className="min-w-0">
              <span className="block font-semibold text-fg">
                {device(s.userAgent)}
                {s.current ? <span className="ml-2 text-xs font-semibold text-mint-ink">This browser</span> : null}
              </span>
              <span className="block text-xs text-muted">
                Signed in {s.createdAt ? formatDateTime(s.createdAt) : "-"} IST · last active {formatDateTime(s.lastSeenAt)} IST
              </span>
            </span>
          </li>
        ))}
      </ul>
      {others ? (
        <div>
          <Button variant="ghost" onClick={signOutOthers} icon={<LogOut size={16} aria-hidden />}>
            Sign out on {others === 1 ? "the other device" : `the ${others} other devices`}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

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
      toast("Password changed. You've been signed out on your other devices.", "success");
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
        <TextField label="New password" type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} hint={`${PASSWORD_MIN} to ${PASSWORD_MAX_BYTES} characters.`} />
        <TextField label="Confirm new password" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <div>
          <Button type="submit">Update password</Button>
        </div>
      </form>
      <Sessions />
    </div>
  );
}

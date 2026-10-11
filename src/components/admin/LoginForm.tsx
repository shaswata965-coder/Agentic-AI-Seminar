"use client";

import { LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Aura } from "@/components/aura/Aura";
import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { useUrlParam } from "@/lib/client-hooks";
import { withBase } from "@/lib/paths";
import { api, ApiError } from "./api";

export function LoginForm() {
  const next = useUrlParam("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api("/auth/login", { method: "POST", json: { email, password } });
      const target = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
      window.location.href = withBase(target);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed.");
      setPending(false);
    }
  }

  return (
    <div className="card w-full max-w-md p-7 sm:p-9">
      <div className="flex flex-col items-center text-center">
        <Aura variant="admin" size={130} />
        <h1 className="mt-2 font-display text-2xl font-bold text-fg">Organiser sign-in</h1>
        <p className="mt-1 text-sm text-muted">Manage the Agentic AI Workshop 2026 website.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <TextField label="E-mail" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? (
          <p role="alert" className="rounded-xl bg-blush-soft px-3 py-2 text-sm font-medium text-blush-ink">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} icon={<LogIn size={18} aria-hidden />}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs text-subtle">Forgotten your password? Ask an administrator to reset it.</p>
    </div>
  );
}

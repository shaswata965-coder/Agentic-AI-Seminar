"use client";

import { CalendarCheck, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import { TextField } from "@/components/forms/fields";
import { postJson } from "@/components/forms/submit";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/paths";
import type { PageCopy } from "@/lib/schema/page-copy";

/*
 * Signing in on the public site, and the agenda kept with the account (see lib/server/visitor-auth.ts for
 * who can sign in). Starring a session needs an account: signed out, it opens the sign-in window and stars
 * the session once signed in.
 */

export interface Account {
  email: string;
  name: string;
  kind: string;
}

interface AccountState {
  /** Null while signed out; undefined until the browser has asked. */
  account: Account | null | undefined;
  agenda: Set<string>;
  /** Save a new agenda (signed in only). */
  saveAgenda: (next: Set<string>) => void;
  /** Open the sign-in window; `then` runs with the account's agenda once signed in. */
  signIn: (opts?: { reason?: string; then?: (agenda: Set<string>) => void }) => void;
  signOut: () => void;
  /** Counts the account menu's "My agenda" clicks, so a programme already open switches to the agenda. */
  agendaRequests: number;
  text: PageCopy["siteAccount"];
}

const AccountContext = createContext<(AccountState & { requestAgenda: () => void }) | null>(null);

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount() outside <AccountProvider>");
  return ctx;
}

/** Where agendas were kept, in the browser, before they needed an account: moved into the account at sign-in. */
const OLD_AGENDA_KEY = "aaiw-agenda";

function oldAgenda(): string[] {
  try {
    const list: unknown = JSON.parse(window.localStorage.getItem(OLD_AGENDA_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string").slice(0, 200) : [];
  } catch {
    return [];
  }
}

export function AccountProvider({ text, children }: { text: PageCopy["siteAccount"]; children: ReactNode }) {
  const toast = useToast();
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [agenda, setAgenda] = useState<Set<string>>(() => new Set());
  const [dialog, setDialog] = useState<{ reason?: string } | null>(null);
  const pending = useRef<((agenda: Set<string>) => void) | null>(null);
  const [agendaRequests, setAgendaRequests] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(withBase("/api/account"), { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: { account: Account | null; agenda: string[] } } | null) => {
        if (cancelled) return;
        setAccount(body?.data?.account ?? null);
        setAgenda(new Set(body?.data?.agenda ?? []));
      })
      .catch(() => !cancelled && setAccount(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const saveAgenda = useCallback(
    (next: Set<string>) => {
      const before = agenda;
      setAgenda(next);
      fetch(withBase("/api/account/agenda"), {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: [...next] }),
      })
        .then((r) => {
          if (r.status === 401) setAccount(null);
          if (!r.ok) throw new Error();
        })
        .catch(() => {
          setAgenda(before);
          toast("Your agenda couldn't be saved. Please try again.", "error");
        });
    },
    [agenda, toast],
  );

  const signIn = useCallback<AccountState["signIn"]>((opts) => {
    pending.current = opts?.then ?? null;
    setDialog({ reason: opts?.reason });
  }, []);

  const signOut = useCallback(() => {
    void postJson("/api/account/logout", {}).finally(() => {
      setAccount(null);
      setAgenda(new Set());
      toast(text.signedOut, "info");
    });
  }, [text.signedOut, toast]);

  const signedIn = useCallback(
    (a: Account, list: string[]) => {
      const saved = new Set(list);
      setAccount(a);
      setAgenda(saved);
      setDialog(null);
      try {
        window.localStorage.removeItem(OLD_AGENDA_KEY);
      } catch {}
      toast(text.signedIn, "success");
      const then = pending.current;
      pending.current = null;
      then?.(saved);
    },
    [text.signedIn, toast],
  );

  const value = useMemo(
    () => ({ account, agenda, saveAgenda, signIn, signOut, agendaRequests, requestAgenda: () => setAgendaRequests((n) => n + 1), text }),
    [account, agenda, saveAgenda, signIn, signOut, agendaRequests, text],
  );
  return (
    <AccountContext.Provider value={value}>
      {children}
      <Modal
        open={dialog !== null}
        onClose={() => {
          pending.current = null;
          setDialog(null);
        }}
        labelledBy="sign-in-title"
        size="md"
        className="fit-screen"
      >
        {dialog ? (
          <SignInForm
            text={text}
            reason={dialog.reason}
            onSignedIn={signedIn}
            onLeave={() => {
              pending.current = null;
              setDialog(null);
            }}
          />
        ) : null}
      </Modal>
    </AccountContext.Provider>
  );
}

function SignInForm({ text, reason, onSignedIn, onLeave }: { text: PageCopy["siteAccount"]; reason?: string; onSignedIn: (a: Account, agenda: string[]) => void; onLeave: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const whoId = useId();
  const who = [text.whoWorkshop, text.whoHackathon, text.whoTeam, text.whoPeople].filter(Boolean);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await postJson<{ account: Account; agenda: string[] }>("/api/account/login", { email, code, agenda: oldAgenda() });
    setBusy(false);
    if (res.ok && res.data) onSignedIn(res.data.account, res.data.agenda);
    else setError(res.message ?? "Sign-in failed.");
  }

  return (
    <div className="tone-azure p-6 sm:p-8">
      <div className="flex items-center gap-4 pr-10">
        <Aura variant="programme" size={84} lite />
        <div className="min-w-0">
          {reason ? <p className="text-xs font-bold tracking-[0.12em] text-accent-ink uppercase">{reason}</p> : null}
          <h2 id="sign-in-title" className="mt-1 font-display text-2xl leading-tight font-bold text-fg">
            {text.title}
          </h2>
        </div>
      </div>
      {text.intro ? <p className="mt-3 text-[15px] text-muted">{text.intro}</p> : null}
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <TextField label={text.email} type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label={text.code}
          type="password"
          required
          autoComplete="current-password"
          aria-describedby={who.length ? whoId : undefined}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {who.length ? (
          <div id={whoId} className="rounded-2xl bg-accent-soft/60 px-4 py-3 text-sm text-muted">
            {text.whoTitle ? <p className="font-semibold text-fg">{text.whoTitle}</p> : null}
            <ul className="mt-1.5 grid list-disc gap-1 pl-4">
              {who.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-xl bg-blush-soft px-3 py-2 text-sm font-medium text-blush-ink">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={busy} icon={<LogIn size={18} aria-hidden />}>
          {busy ? text.signingIn : text.submit}
        </Button>
      </form>
      {text.register ? (
        <p className="mt-4 text-center text-sm">
          <Link href="/register" onClick={onLeave} className="font-semibold text-brand underline underline-offset-2">
            {text.register}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

/**
 * The navigation bar's account button: "Sign in" while signed out; signed in, the person's initial, opening
 * a menu with their name, a link to their agenda and Sign out. `wide` is the phone menu's full-width version.
 */
export function AccountButton({ className, wide, onNavigate }: { className?: string; wide?: boolean; onNavigate?: () => void }) {
  const { account, signIn, signOut, requestAgenda, text } = useAccount();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (account === undefined) return wide ? null : <span aria-hidden className={cn("h-9 w-20", className)} />;
  if (!account)
    return (
      <Button variant="outline" size={wide ? "lg" : "sm"} className={cn(!wide && "max-xl:w-9 max-xl:px-0", className)} icon={<LogIn size={wide ? 18 : 16} aria-hidden />} onClick={() => signIn()}>
        {/* Beside the navigation links there is room for the word only on wide screens. */}
        <span className={cn(!wide && "max-xl:sr-only")}>{text.signIn}</span>
      </Button>
    );

  const links = (
    <>
      <Link href="/programme?agenda=1#schedule" onClick={() => (setOpen(false), requestAgenda(), onNavigate?.())} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-fg hover:bg-surface-2">
        <CalendarCheck size={16} aria-hidden className="text-accent-ink" /> {text.myAgenda}
      </Link>
      <button type="button" onClick={() => (setOpen(false), signOut())} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-fg hover:bg-surface-2">
        <LogOut size={16} aria-hidden className="text-subtle" /> {text.signOut}
      </button>
    </>
  );
  const who = (
    <div className="min-w-0 px-3 py-2">
      <p className="truncate font-semibold text-fg">{account.name}</p>
      <p className="truncate text-xs text-subtle">{account.email}</p>
    </div>
  );

  if (wide) return <div className={cn("tone-azure grid gap-1 rounded-2xl border border-border bg-surface p-2", className)}>{who}{links}</div>;
  return (
    <div ref={box} className={cn("relative", className)}>
      <button
        type="button"
        data-ripple=""
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${account.name}: account menu`}
        onClick={() => setOpen((o) => !o)}
        className="key key-line tone-azure grid h-10 w-10 place-items-center rounded-xl border border-border-strong bg-accent-soft font-display text-base font-bold text-accent-ink"
      >
        {(account.name || account.email).trim().charAt(0).toUpperCase()}
      </button>
      {open ? (
        <div id={menuId} className="absolute top-full right-0 z-50 mt-3 w-64 origin-top-right animate-pop rounded-2xl border border-border bg-surface p-2 shadow-card-lg">
          {who}
          <div className="my-1 h-px bg-border" />
          {links}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { ArrowRight, CalendarDays, CornerDownLeft, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Aura } from "./Aura";
import { AuraHead } from "./AuraHead";

export interface AssistantEntry {
  kind: "Page" | "Section" | "FAQ" | "Speaker" | "Session" | "Tutorial";
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string;
}

export interface AssistantFacts {
  eventName: string;
  dates: string;
  venue: string;
  registerHref: string;
  hackathonHref: string;
}

const QUICK = [
  { label: "When & where?", q: "when where" },
  { label: "How do I register?", q: "register" },
  { label: "Hackathon", q: "hackathon" },
  { label: "Programme", q: "programme schedule" },
  { label: "Getting there", q: "travel metro airport" },
  { label: "Contact", q: "contact email" },
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

function score(entry: AssistantEntry, terms: string[]) {
  const title = norm(entry.title);
  const hay = norm(`${entry.title} ${entry.subtitle ?? ""} ${entry.keywords ?? ""} ${entry.kind}`);
  let total = 0;
  for (const t of terms) {
    if (title.includes(t)) total += title.startsWith(t) ? 6 : 4;
    else if (hay.includes(t)) total += 2;
    else if (t.length > 4 && hay.includes(t.slice(0, -1))) total += 1;
    else return 0;
  }
  return total + (entry.kind === "Page" ? 1 : 0);
}

/** Floating "Ask Aura" helper: a command palette over pages, FAQs, speakers and sessions. */
export function AuraAssistant({ entries, facts }: { entries: AssistantEntry[]; facts: AssistantFacts }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const deferred = useDeferredValue(query);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && d.open) d.close();
  }, [open]);

  const terms = useMemo(() => norm(deferred).split(/\s+/).filter((t) => t.length > 1), [deferred]);
  const results = useMemo(() => {
    if (!terms.length) return entries.filter((e) => e.kind === "Page" || e.kind === "Section").slice(0, 8);
    return entries
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
      .map((r) => r.e);
  }, [entries, terms]);

  const wantsFacts = /\b(when|date|dates|where|venue|location|time)\b/.test(norm(deferred));
  const mood = !query ? "assistant" : results.length ? "answer" : "notFound";

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        data-aura-assistant
        onClick={() => setOpen(true)}
        className="group key key-line fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-2xl border border-border-strong bg-surface/95 py-1.5 pr-4 pl-1.5 backdrop-blur hover:border-brand sm:right-6 sm:bottom-6"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--azure-soft),var(--lilac-soft))]">
          <span aria-hidden className="absolute inset-0 animate-ping-soft rounded-xl bg-[var(--aqua)] opacity-30 motion-desktop-only" />
          <AuraHead size={32} className="relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
        </span>
        <span className="sr-only text-sm font-semibold text-fg sm:not-sr-only">Ask Aura</span>
        <span className="sr-only">, search the site</span>
        <kbd aria-hidden className="hidden rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-subtle md:inline">
          ⌘K
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        aria-label="Ask Aura"
        className="mx-auto mt-[8vh] w-[calc(100%-1.5rem)] max-w-xl overflow-visible rounded-[1.75rem] border border-border bg-surface p-0 text-fg shadow-card-lg open:animate-pop"
      >
        {open ? (
          <div className="relative">
            <div className="absolute -top-16 right-6 hidden sm:block">
              <Aura variant={mood} size={96} lite />
            </div>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search size={20} aria-hidden className="shrink-0 text-subtle" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && results[active]) {
                    e.preventDefault();
                    go(results[active].href);
                  }
                }}
                placeholder="Ask Aura, e.g. “hackathon dates” or “metro”"
                className="h-11 w-full bg-transparent text-base outline-none placeholder:text-subtle"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[11px] text-subtle sm:inline">Esc</kbd>
            </div>

            <div className="max-h-[60dvh] overflow-y-auto p-3">
              {!query ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {QUICK.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setQuery(q.q);
                        inputRef.current?.focus();
                      }}
                      className="rounded-md bg-surface-2 px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-accent-soft hover:text-accent-ink"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {wantsFacts || !query ? (
                <div className="tone-aqua mb-3 rounded-2xl bg-accent-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-accent-ink">
                    <Sparkles size={16} aria-hidden /> {facts.eventName}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[15px] text-fg">
                    <CalendarDays size={16} aria-hidden className="text-subtle" /> {facts.dates}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[15px] text-fg">
                    <MapPin size={16} aria-hidden className="text-subtle" /> {facts.venue}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={facts.registerHref}
                      onClick={() => setOpen(false)}
                      className="key key-brand rounded-[0.7rem] bg-brand px-3.5 py-1.5 text-sm font-semibold text-brand-fg"
                    >
                      Register
                    </Link>
                    <Link
                      href={facts.hackathonHref}
                      onClick={() => setOpen(false)}
                      className="key key-line rounded-[0.7rem] border border-border-strong bg-surface px-3.5 py-1.5 text-sm font-semibold text-fg"
                    >
                      Join the hackathon
                    </Link>
                  </div>
                </div>
              ) : null}

              {results.length ? (
                <ul id={listId} role="listbox" aria-label="Results" className="grid gap-1">
                  {results.map((r, i) => (
                    <li key={`${r.kind}-${r.href}-${r.title}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r.href)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                          i === active ? "bg-surface-2" : "hover:bg-surface-2",
                        )}
                      >
                        <span className="w-16 shrink-0 text-[11px] font-bold tracking-wider text-subtle uppercase">{r.kind}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-fg">{r.title}</span>
                          {r.subtitle ? <span className="block truncate text-sm text-muted">{r.subtitle}</span> : null}
                        </span>
                        {i === active ? <CornerDownLeft size={16} aria-hidden className="text-subtle" /> : <ArrowRight size={16} aria-hidden className="text-subtle" />}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-6 text-center text-muted">
                  I couldn&apos;t find that. Try another word, or{" "}
                  <Link className="font-semibold text-brand underline" href="/#contact" onClick={() => setOpen(false)}>
                    ask the organisers
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

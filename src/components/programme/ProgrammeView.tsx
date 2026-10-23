"use client";

import { CalendarPlus, ChevronDown, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAccount } from "@/components/account/Account";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { currentThemeKey, SESSION_TYPE_META, SESSION_TYPES, THEME_KEYS, THEME_META, type SessionType, type ThemeKey } from "@/lib/content/constants";
import type { Session } from "@/lib/content/types";
import { timeRange } from "@/lib/format";
import { replaceQuery, useNow, useUrlHash, useUrlParam } from "@/lib/client-hooks";
import { withBase } from "@/lib/paths";
import { SessionBadges, SessionRoom } from "./SessionMeta";

export interface ProgrammeSession extends Session {
  startIso: string;
  endIso: string;
}
export interface MiniSpeaker {
  id: string;
  name: string;
  slug: string;
  affiliation: string;
}

const EMPTY = new Set<string>();

const parseList = <T extends string>(raw: string | null, allowed: readonly T[]) =>
  new Set((raw ?? "").split(",").filter((t): t is T => (allowed as readonly string[]).includes(t)));

function Chip({ on, onClick, children, tone }: { on: boolean; onClick: () => void; children: ReactNode; tone?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      data-ripple=""
      className={cn(
        tone,
        "key key-sm rounded-[0.6rem] border px-3 py-1.5 text-sm font-semibold",
        on ? "bg-accent-soft text-accent-ink border-[color-mix(in_oklab,var(--accent)_55%,transparent)] [--key-edge:color-mix(in_oklab,var(--accent)_70%,var(--accent-ink))]" : "key-line border-border bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function ProgrammeView({
  sessions,
  speakers,
  days,
}: {
  sessions: ProgrammeSession[];
  speakers: Record<string, MiniSpeaker>;
  days: { day: number; label: string }[];
}) {
  const toast = useToast();
  const now = useNow();
  // Initial filters come from the URL (?day=2&theme=science&type=panel or #session-id);
  // once the visitor changes something, local state takes over.
  const urlDay = useUrlParam("day");
  // An old link's earlier theme key ("entrepreneurship") filters by the current one.
  const urlTheme = useUrlParam("theme")?.replace(/[^,]+/g, currentThemeKey) ?? null;
  const urlType = useUrlParam("type");
  const hash = useUrlHash();
  const hashDay = hash.startsWith("session-") ? sessions.find((x) => `session-${x.id}` === hash)?.day : undefined;
  const defaultDay = days[0]?.day ?? 1;
  const linkedDay = Number(hashDay ?? urlDay);

  const [dayChoice, setDay] = useState<number | null>(null);
  const [themeChoice, setThemes] = useState<Set<ThemeKey> | null>(null);
  const [typeChoice, setTypes] = useState<Set<SessionType> | null>(null);
  const [q, setQ] = useState("");
  // ?agenda=1 (the account menu's "My agenda") opens on the visitor's own sessions.
  const [agendaChoice, setAgendaOnly] = useState<boolean | null>(null);
  // The agenda is kept with the visitor's account: starring needs one (components/account/Account.tsx).
  const { account, agenda: saved, saveAgenda, signIn, agendaRequests, text: accountText } = useAccount();
  // Only sessions still in the programme count (one starred before it was deleted is left out).
  const agenda = useMemo(() => (account ? new Set(sessions.filter((x) => saved.has(x.id)).map((x) => x.id)) : EMPTY), [account, saved, sessions]);
  // The account menu's "My agenda", clicked while the programme is open.
  const [seenRequests, setSeenRequests] = useState(agendaRequests);
  if (seenRequests !== agendaRequests) {
    setSeenRequests(agendaRequests);
    setAgendaOnly(true);
  }
  const urlAgenda = useUrlParam("agenda") === "1";
  const agendaOnly = Boolean(account) && (agendaChoice ?? urlAgenda);

  const day = dayChoice ?? (days.some((d) => d.day === linkedDay) ? linkedDay : defaultDay);
  const themes = useMemo(() => themeChoice ?? parseList(urlTheme, THEME_KEYS), [themeChoice, urlTheme]);
  const types = useMemo(() => typeChoice ?? parseList(urlType, SESSION_TYPES), [typeChoice, urlType]);

  // Scroll to a linked session (#session-id).
  useEffect(() => {
    if (!hash.startsWith("session-")) return;
    const t = setTimeout(() => {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ block: "center" });
      el?.classList.add("ring-2", "ring-brand");
    }, 250);
    return () => clearTimeout(t);
  }, [hash]);

  // Keep the URL shareable once the visitor has changed a filter.
  useEffect(() => {
    if (dayChoice === null && themeChoice === null && typeChoice === null) return;
    replaceQuery((p) => {
      if (day !== defaultDay) p.set("day", String(day));
      else p.delete("day");
      if (themes.size) p.set("theme", [...themes].join(","));
      else p.delete("theme");
      if (types.size) p.set("type", [...types].join(","));
      else p.delete("type");
    });
  }, [dayChoice, themeChoice, typeChoice, day, themes, types, defaultDay]);

  const toggle = <T,>(set: Set<T>, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  function star(id: string, title: string) {
    const apply = (current: Set<string>) => {
      const next = toggle(current, id);
      saveAgenda(next);
      toast(next.has(id) ? `Added “${title}” to your agenda` : "Removed from your agenda", next.has(id) ? "success" : "info");
    };
    // Signed out: sign in first, then star it (unless it was already in the agenda kept with the account).
    if (!account) signIn({ reason: accountText.needSignIn, then: (current) => (current.has(id) ? undefined : apply(current)) });
    else apply(agenda);
  }

  function showAgenda() {
    if (account) setAgendaOnly(!agendaOnly);
    else signIn({ reason: accountText.needSignIn, then: () => setAgendaOnly(true) });
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sessions.filter((s) => {
      if (Number(s.day) !== day) return false;
      if (themes.size && !themes.has(s.theme)) return false;
      if (types.size && !types.has(s.type)) return false;
      if (agendaOnly && !agenda.has(s.id)) return false;
      if (needle) {
        const people = [...s.speakers, ...s.panelists, s.moderator].map((id) => speakers[id]?.name ?? "").join(" ");
        if (!`${s.title} ${s.description} ${s.room} ${people} ${s.speakerNote}`.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [sessions, day, themes, types, agendaOnly, agenda, q, speakers]);

  const groups = useMemo(() => {
    const map = new Map<string, ProgrammeSession[]>();
    for (const s of filtered) map.set(s.start, [...(map.get(s.start) ?? []), s]);
    return [...map.entries()];
  }, [filtered]);
  const shownCount = filtered.length;
  const dayLabel = days.find((d) => d.day === day)?.label ?? "";

  const upcomingId = useMemo(() => {
    if (now === null) return null;
    // Only meaningful on the day: flag the next session when it starts within 12 hours.
    const soon = sessions.filter((s) => Date.parse(s.startIso) > now && Date.parse(s.startIso) - now < 12 * 3_600_000);
    return soon.sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso))[0]?.id ?? null;
  }, [now, sessions]);

  const activeFilters = themes.size + types.size + (q ? 1 : 0) + (agendaOnly ? 1 : 0);
  const presentTypes = SESSION_TYPES.filter((t) => sessions.some((s) => s.type === t));
  const presentThemes = THEME_KEYS.filter((t) => sessions.some((s) => s.theme === t));

  return (
    <div>
      {/* Day tabs */}
      <div role="tablist" aria-label="Programme day" className="flex flex-wrap gap-2">
        {days.map((d) => {
          const on = d.day === day;
          const count = sessions.filter((s) => Number(s.day) === d.day).length;
          return (
            <button
              key={d.day}
              id={`day-tab-${d.day}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="programme-panel"
              onClick={() => setDay(d.day)}
              data-ripple=""
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-5 py-3 text-left transition",
                on ? "border-brand bg-brand text-brand-fg shadow-card" : "border-border bg-surface text-fg hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card",
              )}
            >
              <span className={cn("font-display text-2xl font-extrabold transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]", on ? "scale-110 -rotate-3" : "group-hover:-rotate-3")}>D{d.day}</span>
              <span className="leading-tight">
                <span className="block text-sm font-bold">Day {d.day}</span>
                <span className={cn("block text-xs", on ? "opacity-85" : "text-subtle")}>
                  {d.label} · {count} sessions
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card mt-5 grid gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[14rem] flex-1">
            <span className="sr-only">Search sessions</span>
            <Search size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, speakers, rooms…"
              className="h-11 w-full rounded-xl border border-border bg-surface pr-4 pl-10 text-[15px] focus:border-brand focus:ring-4 focus:ring-[color-mix(in_oklab,var(--brand)_18%,transparent)] focus:outline-none"
            />
          </label>
          <button
            type="button"
            aria-pressed={agendaOnly}
            onClick={showAgenda}
            data-ripple=""
            className={cn(
              "tone-butter key key-sm inline-flex h-11 items-center gap-2 rounded-[0.75rem] border px-4 text-sm font-semibold",
              agendaOnly ? "bg-accent-soft text-accent-ink border-[color-mix(in_oklab,var(--accent)_55%,transparent)] [--key-edge:color-mix(in_oklab,var(--accent)_70%,var(--accent-ink))]" : "key-line border-border bg-surface text-muted hover:text-fg",
            )}
          >
            <Star size={16} aria-hidden fill={agendaOnly ? "currentColor" : "none"} /> My agenda ({agenda.size})
          </button>
          {activeFilters ? (
            <button
              type="button"
              onClick={() => {
                setThemes(new Set());
                setTypes(new Set());
                setQ("");
                setAgendaOnly(false);
              }}
              className="group/clear mi-link inline-flex animate-pop items-center gap-1 text-sm font-semibold text-brand"
            >
              <X size={15} aria-hidden className="transition-transform duration-300 group-hover/clear:rotate-90" /> Clear filters
            </button>
          ) : null}
        </div>
        {presentThemes.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by theme">
            <span className="mr-1 text-xs font-bold tracking-[0.12em] text-subtle uppercase">Theme</span>
            {presentThemes.map((t) => (
              <Chip key={t} on={themes.has(t)} onClick={() => setThemes(toggle(themes, t))} tone={`tone-${THEME_META[t].tone}`}>
                {THEME_META[t].short}
              </Chip>
            ))}
          </div>
        ) : null}
        {presentTypes.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by session type">
            <span className="mr-1 text-xs font-bold tracking-[0.12em] text-subtle uppercase">Type</span>
            {presentTypes.map((t) => (
              <Chip key={t} on={types.has(t)} onClick={() => setTypes(toggle(types, t))} tone={`tone-${SESSION_TYPE_META[t].tone}`}>
                {SESSION_TYPE_META[t].label}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      {/* Timeline */}
      <div id="programme-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className="mt-8">
        <h2 className="sr-only">
          Day {day}
          {dayLabel ? ` · ${dayLabel}` : ""}
        </h2>
        <p className="sr-only" role="status">
          {shownCount === 1 ? "1 session shown" : `${shownCount} sessions shown`}
        </p>
        {groups.length ? (
          <ol className="relative grid gap-6 before:absolute before:top-2 before:bottom-2 before:left-[4.6rem] before:hidden before:w-px before:bg-border sm:before:block">
            {groups.map(([start, list]) => (
              <li key={start} className="grid gap-3 sm:grid-cols-[5.5rem_1fr] sm:gap-6">
                <div className="sm:pt-4">
                  <p className="relative font-display text-xl font-bold text-fg tabular sm:text-right">
                    {start}
                    <span aria-hidden className="absolute top-2 -right-[1.45rem] hidden h-3 w-3 rounded-full border-2 border-surface bg-brand sm:block" />
                  </p>
                </div>
                <ul className={cn("grid gap-3", list.length > 1 && "lg:grid-cols-2")}>
                  {list.map((s) => {
                    const live = now !== null && now >= Date.parse(s.startIso) && now < Date.parse(s.endIso);
                    const next = s.id === upcomingId;
                    const starred = agenda.has(s.id);
                    const isBreak = s.type === "break";
                    const people = (s.type === "panel" ? s.panelists : s.speakers).map((id) => speakers[id]).filter(Boolean);
                    const moderator = s.moderator ? speakers[s.moderator] : undefined;
                    return (
                      <li
                        key={s.id}
                        id={`session-${s.id}`}
                        data-glow={isBreak ? undefined : ""}
                        className={cn(
                          `tone-${(SESSION_TYPE_META[s.type] ?? SESSION_TYPE_META.other).tone}`,
                          "scroll-mt-28 rounded-3xl border p-5 transition-[box-shadow,translate]",
                          isBreak ? "border-dashed border-border-strong bg-accent-soft/50" : "card hover:-translate-y-0.5 hover:shadow-card-lg",
                          live && "ring-2 ring-mint",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <SessionBadges session={s} />
                            {live ? (
                              <Badge tone="mint" size="xs" dot>
                                Live now
                              </Badge>
                            ) : next ? (
                              <Badge tone="butter" size="xs" dot>
                                Up next
                              </Badge>
                            ) : null}
                          </div>
                          {!isBreak ? (
                            <div className="flex items-center gap-1">
                              <a
                                href={withBase(`/api/calendar?session=${encodeURIComponent(s.id)}`)}
                                download
                                data-ripple=""
                                className="grid h-9 w-9 place-items-center rounded-lg text-subtle transition hover:-translate-y-0.5 hover:bg-surface-2 hover:text-fg"
                                aria-label={`Add “${s.title}” to your calendar`}
                                title="Add to calendar"
                              >
                                <CalendarPlus size={17} aria-hidden />
                              </a>
                              <button
                                type="button"
                                onClick={() => star(s.id, s.title)}
                                aria-pressed={starred}
                                aria-label={starred ? `Remove “${s.title}” from my agenda` : `Add “${s.title}” to my agenda`}
                                title={starred ? "In my agenda" : "Add to my agenda"}
                                data-burst=""
                                className={cn("grid h-9 w-9 place-items-center rounded-lg transition hover:bg-surface-2", starred ? "text-butter-ink" : "text-subtle hover:text-fg")}
                              >
                                <Star size={18} aria-hidden fill={starred ? "currentColor" : "none"} />
                              </button>
                            </div>
                          ) : null}
                        </div>
                        <h3 className="mt-3 font-display text-lg leading-snug font-semibold text-fg sm:text-xl">{s.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-subtle tabular">{timeRange(s.start, s.end)}</p>
                        {moderator || people.length || s.speakerNote ? (
                          <div className="mt-3 space-y-1.5 text-sm text-muted">
                            {moderator ? (
                              <p>
                                <span className="font-semibold text-subtle">Moderator: </span>
                                <Link className="font-semibold text-fg underline decoration-border-strong underline-offset-2 hover:decoration-brand hover:underline-offset-4" href={`/speakers?speaker=${encodeURIComponent(moderator.slug)}`}>
                                  {moderator.name}
                                </Link>
                              </p>
                            ) : null}
                            {people.length ? (
                              <p>
                                {s.type === "panel" ? <span className="font-semibold text-subtle">Panelists: </span> : null}
                                {people.map((p, i) => (
                                  <span key={p.id}>
                                    {i ? ", " : ""}
                                    <Link className="font-semibold text-fg underline decoration-border-strong underline-offset-2 hover:decoration-brand hover:underline-offset-4" href={`/speakers?speaker=${encodeURIComponent(p.slug)}`}>
                                      {p.name}
                                    </Link>
                                    {p.affiliation ? <span className="text-subtle"> · {p.affiliation}</span> : null}
                                  </span>
                                ))}
                              </p>
                            ) : (
                              <p>{s.speakerNote}</p>
                            )}
                          </div>
                        ) : null}
                        {!isBreak ? (
                          <div className="mt-3">
                            <SessionRoom room={s.room} />
                          </div>
                        ) : null}
                        {s.description ? (
                          <details className="group mt-3">
                            <summary className="inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">
                              Details <ChevronDown size={15} aria-hidden className="transition-transform group-open:rotate-180" />
                            </summary>
                            <RichText text={s.description} className="mt-2 text-sm text-muted" />
                          </details>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <div className="card flex flex-col items-center p-10 text-center">
            <Aura variant={agendaOnly ? "programme" : "notFound"} size={140} />
            <p className="mt-3 font-display text-xl font-semibold text-fg">{agendaOnly ? "Your agenda is empty for this day" : "No sessions match these filters"}</p>
            <p className="mt-1 text-muted">{agendaOnly ? "Tap the ☆ on any session to add it to your agenda." : "Try removing a filter or searching for something else."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

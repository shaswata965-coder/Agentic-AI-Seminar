"use client";

import { ArrowLeft, ArrowRight, CalendarDays, Globe, GraduationCap, MapPin, Mic2, Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreSpeakersCard } from "@/components/home/SpeakersPreview";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/BrandIcons";
import { Modal } from "@/components/ui/Modal";
import { PersonCard } from "@/components/ui/PersonCard";
import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/cn";
import { replaceQuery, useUrlParam } from "@/lib/client-hooks";
import { SPEAKER_CATEGORY_META, THEME_META } from "@/lib/content/constants";
import type { Session, Speaker } from "@/lib/content/types";
import { timeRange } from "@/lib/format";

export interface SpeakerSession extends Pick<Session, "id" | "title" | "type" | "theme" | "day" | "start" | "end" | "room" | "speakers" | "panelists" | "moderator"> {
  dayLabel: string;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "academia", label: "Academia" },
  { id: "industry", label: "Industry" },
  { id: "panelist", label: "Panelists" },
] as const;

function Links({ sp }: { sp: Speaker }) {
  const items = [
    { href: sp.website, label: "Website", Icon: Globe },
    { href: sp.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: sp.x, label: "X", Icon: XIcon },
    { href: sp.scholar, label: "Google Scholar", Icon: GraduationCap },
    { href: sp.github, label: "GitHub", Icon: GitHubIcon },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            <Icon size={15} aria-hidden /> {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SpeakersView({ speakers, sessions, showMore }: { speakers: Speaker[]; sessions: SpeakerSession[]; showMore: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const urlSlug = useUrlParam("speaker");
  const [slugChoice, setOpenSlug] = useState<string | null | undefined>(undefined);

  const bySlug = useMemo(() => Object.fromEntries(speakers.map((s) => [s.slug, s])), [speakers]);
  const byId = useMemo(() => Object.fromEntries(speakers.map((s) => [s.id, s])), [speakers]);
  const panels = sessions.filter((s) => s.type === "panel");

  const isPanelist = useCallback((sp: Speaker) => sp.category === "panelist" || panels.some((p) => p.panelists.includes(sp.id) || p.moderator === sp.id), [panels]);

  const shown = speakers.filter((sp) => {
    if (filter === "panelist" ? !isPanelist(sp) : filter !== "all" && sp.category !== filter) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${sp.name} ${sp.affiliation} ${sp.designation} ${sp.talkTitle}`.toLowerCase().includes(needle);
  });

  const open = useCallback((slug: string | null) => {
    setOpenSlug(slug);
    replaceQuery((p) => (slug ? p.set("speaker", slug) : p.delete("speaker")));
  }, []);

  // Deep link: /speakers?speaker=slug opens that profile.
  const openSlug = slugChoice === undefined ? (urlSlug && bySlug[urlSlug] ? urlSlug : null) : slugChoice;

  const current = openSlug ? bySlug[openSlug] : undefined;
  const idx = current ? shown.findIndex((s) => s.slug === current.slug) : -1;
  const list = idx >= 0 ? shown : speakers;
  const pos = current ? list.findIndex((s) => s.slug === current.slug) : -1;
  const go = (d: number) => {
    if (pos < 0 || list.length < 2) return;
    open(list[(pos + d + list.length) % list.length].slug);
  };

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const appearances = current ? sessions.filter((s) => s.speakers.includes(current.id) || s.panelists.includes(current.id) || s.moderator === current.id) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter speakers" className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1 shadow-card">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                filter === f.id ? "bg-accent-soft text-accent-ink ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : "text-muted hover:text-fg",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full max-w-xs">
          <span className="sr-only">Search speakers</span>
          <Search size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or affiliation"
            className="h-11 w-full rounded-full border border-border bg-surface pr-4 pl-10 text-[15px] focus:border-brand focus:ring-4 focus:ring-[color-mix(in_oklab,var(--brand)_18%,transparent)] focus:outline-none"
          />
        </label>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        {shown.map((sp) => {
          const cat = SPEAKER_CATEGORY_META[sp.category] ?? SPEAKER_CATEGORY_META.academia;
          return (
            <li key={sp.id}>
              <button type="button" onClick={() => open(sp.slug)} className="block h-full w-full rounded-3xl text-left" aria-haspopup="dialog" aria-label={`${sp.name}, ${sp.affiliation}. Open profile`}>
                <PersonCard
                  name={sp.name}
                  photo={sp.photo}
                  title={sp.designation}
                  subtitle={sp.affiliation}
                  label={sp.keynote ? "Keynote" : cat.label}
                  labelTone={sp.keynote ? "butter" : cat.tone}
                  className={`tone-${cat.tone}`}
                  highlight={
                    sp.keynote ? (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-butter text-[#5b3d00] shadow-card ring-2 ring-surface">
                        <Star size={15} aria-hidden fill="currentColor" />
                      </span>
                    ) : null
                  }
                  footer={sp.talkTitle ? <p className="line-clamp-2 text-sm font-medium text-accent-ink">“{sp.talkTitle}”</p> : <p className="text-sm font-semibold text-accent-ink">View profile</p>}
                />
              </button>
            </li>
          );
        })}
        {showMore && filter === "all" && !q ? (
          <li>
            <MoreSpeakersCard />
          </li>
        ) : null}
      </ul>
      {!shown.length && (filter !== "all" || q) ? <p className="mt-6 rounded-2xl border border-dashed border-border-strong p-8 text-center text-muted">No speakers match your filters yet.</p> : null}

      {/* Panel discussions */}
      <section id="panels" aria-labelledby="panels-title" className="mt-20 scroll-mt-28">
        <h2 id="panels-title" className="font-display text-3xl font-bold text-fg">
          Panel discussions
        </h2>
        {panels.length ? (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {panels.map((p) => {
              const theme = THEME_META[p.theme] ?? THEME_META.general;
              const moderator = p.moderator ? byId[p.moderator] : undefined;
              return (
                <li key={p.id} className={`tone-${theme.tone} card p-6`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="peach" size="xs" dot>
                      Panel
                    </Badge>
                    <Badge tone={theme.tone} size="xs">
                      {theme.short}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-fg">{p.title}</h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} aria-hidden /> {p.dayLabel} · {timeRange(p.start, p.end)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} aria-hidden /> {p.room || "Room TBA"}
                    </span>
                  </p>
                  <div className="mt-4 grid gap-2">
                    {moderator ? (
                      <p className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 font-semibold text-subtle">
                          <Mic2 size={15} aria-hidden /> Moderator
                        </span>
                        <button type="button" onClick={() => open(moderator.slug)} className="inline-flex items-center gap-2 rounded-full bg-surface-2 py-1 pr-3 pl-1 font-semibold text-fg hover:bg-accent-soft">
                          <Avatar name={moderator.name} src={moderator.photo} size={26} />
                          {moderator.name}
                        </button>
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 font-semibold text-subtle">
                        <Users size={15} aria-hidden /> Panelists
                      </span>
                      {p.panelists.length ? (
                        p.panelists
                          .map((id) => byId[id])
                          .filter(Boolean)
                          .map((sp) => (
                            <button key={sp.id} type="button" onClick={() => open(sp.slug)} className="inline-flex items-center gap-2 rounded-full bg-surface-2 py-1 pr-3 pl-1 font-semibold text-fg hover:bg-accent-soft">
                              <Avatar name={sp.name} src={sp.photo} size={26} />
                              {sp.name}
                            </button>
                          ))
                      ) : (
                        <span className="text-muted">To be announced</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 max-w-2xl text-muted">Panel topics, moderators and panelists will be announced along with the programme.</p>
        )}
      </section>

      <Modal open={Boolean(current)} onClose={() => open(null)} labelledBy="speaker-modal-title" size="xl">
        {current ? (
          <div>
            <div className={`tone-${(SPEAKER_CATEGORY_META[current.category] ?? SPEAKER_CATEGORY_META.academia).tone} relative overflow-hidden rounded-t-[1.75rem] bg-accent-soft px-6 pt-8 pb-6 sm:px-10`}>
              <div aria-hidden className="bg-dots absolute inset-0 opacity-60" />
              <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Avatar name={current.name} src={current.photo} size={120} className="ring-4 ring-surface" />
                <div>
                  <div className="flex flex-wrap gap-2">
                    {current.keynote ? (
                      <Badge tone="butter" size="xs">
                        Keynote speaker
                      </Badge>
                    ) : null}
                    <Badge tone={(SPEAKER_CATEGORY_META[current.category] ?? SPEAKER_CATEGORY_META.academia).tone} size="xs">
                      {(SPEAKER_CATEGORY_META[current.category] ?? SPEAKER_CATEGORY_META.academia).label}
                    </Badge>
                    {current.theme && current.theme !== "general" ? (
                      <Badge tone="neutral" size="xs">
                        {THEME_META[current.theme].short}
                      </Badge>
                    ) : null}
                  </div>
                  <h2 id="speaker-modal-title" className="mt-2 font-display text-3xl font-bold text-fg">
                    {current.name}
                  </h2>
                  <p className="text-muted">{[current.designation, current.affiliation].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6 px-6 py-6 sm:px-10 sm:py-8">
              <Links sp={current} />
              {current.talkTitle ? (
                <div className="rounded-2xl border border-border bg-surface-2 p-5">
                  <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">Talk</p>
                  <p className="mt-1 font-display text-xl font-semibold text-fg">{current.talkTitle}</p>
                  <RichText text={current.talkAbstract} className="mt-2 text-[15px] leading-relaxed text-muted" />
                </div>
              ) : null}
              {current.bio ? (
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">Bio</p>
                  <RichText text={current.bio} className="mt-2 text-[15px] leading-relaxed text-muted" />
                </div>
              ) : null}
              {appearances.length ? (
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">In the programme</p>
                  <ul className="mt-2 grid gap-2">
                    {appearances.map((a) => (
                      <li key={a.id}>
                        <Link href={`/programme?day=${a.day}#session-${a.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3 hover:border-brand">
                          <span>
                            <span className="block font-semibold text-fg">{a.title}</span>
                            <span className="text-sm text-muted">
                              {a.dayLabel} · {timeRange(a.start, a.end)} · {a.room || "Room TBA"}
                            </span>
                          </span>
                          <ArrowRight size={17} aria-hidden className="text-subtle" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {list.length > 1 ? (
                <div className="flex items-center justify-between border-t border-border pt-5">
                  <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
                    <ArrowLeft size={16} aria-hidden /> Previous
                  </button>
                  <span className="text-xs text-subtle">Use ← → keys</span>
                  <button type="button" onClick={() => go(1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
                    Next <ArrowRight size={16} aria-hidden />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
